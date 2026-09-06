import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../shared/prisma-module/prisma.service";
import {
  CreateVacancyDto,
  UpdateVacancyDto,
  VacancySearchInput,
  VacancyResponseDto,
  CreateVacancyApplicationDto,
  VacancyApplicationResponseDto,
  UpdateApplicationStatusDto,
  VacancyQuestionDto,
  VacancyAnswerDto,
  VacancyQuestionType,
  CHOICE_QUESTION_TYPES,
  MAX_QUESTIONS_PER_VACANCY,
  MAX_OPTIONS_PER_QUESTION,
} from "../dto/vacancy.dto";
import { plainToInstance } from "class-transformer";
import { Prisma } from "@prisma/client";
import { RequestContext } from "../../shared/request-context/request-context.dto";
import { ActivityLogService } from "../../activity-log/activity-log.service";
import { ActivityAction, ActivityEntity } from "@prisma/client";

@Injectable()
export class VacancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogService: ActivityLogService,
  ) { }

  /**
   * Validates a question set and returns it ready for the Json column.
   * Order is preserved exactly as received - the client should not have to
   * sort defensively.
   */
  private normalizeQuestions(
    questions: VacancyQuestionDto[],
  ): Prisma.InputJsonValue {
    if (questions.length > MAX_QUESTIONS_PER_VACANCY) {
      throw new BadRequestException(
        `A vacancy may not have more than ${MAX_QUESTIONS_PER_VACANCY} questions`,
      );
    }

    const seen = new Set<string>();

    return questions.map((question, index) => {
      const type = question.type ?? VacancyQuestionType.TEXT;

      if (seen.has(question.id)) {
        throw new BadRequestException(
          `Duplicate question id "${question.id}" - ids must be unique within a vacancy`,
        );
      }
      seen.add(question.id);

      // Choice questions need real options; everything else stores [].
      const options = (question.options ?? []).filter(
        (option) => typeof option === "string" && option.trim() !== "",
      );

      if (CHOICE_QUESTION_TYPES.includes(type)) {
        if (options.length < 2) {
          throw new BadRequestException(
            `Question "${question.label}" is ${type} and needs at least two non-blank options`,
          );
        }
        if (options.length > MAX_OPTIONS_PER_QUESTION) {
          throw new BadRequestException(
            `Question "${question.label}" exceeds ${MAX_OPTIONS_PER_QUESTION} options`,
          );
        }
      }

      return {
        id: question.id,
        label: question.label,
        type,
        required: question.required ?? false,
        helpText: question.helpText ?? "",
        options: CHOICE_QUESTION_TYPES.includes(type) ? options : [],
        order: question.order ?? index,
      };
    });
  }

  /** Reads the Json column back as a typed array. */
  private readQuestions(value: Prisma.JsonValue | null): VacancyQuestionDto[] {
    return Array.isArray(value) ? (value as unknown as VacancyQuestionDto[]) : [];
  }

  private isBlank(value: VacancyAnswerDto["value"]): boolean {
    if (value === null || value === undefined) return true;
    if (typeof value === "string") return value.trim() === "";
    if (Array.isArray(value)) return value.length === 0;
    return false;
  }

  /**
   * Checks submitted answers against the vacancy's current question set and
   * returns them for the Json column. `label` and `type` are stored exactly
   * as sent - they are a deliberate snapshot, never re-derived, so an
   * application stays readable after a question is reworded or deleted.
   */
  private normalizeAnswers(
    answers: VacancyAnswerDto[],
    questions: VacancyQuestionDto[],
  ): Prisma.InputJsonValue {
    const byId = new Map(questions.map((q) => [q.id, q]));

    for (const answer of answers) {
      if (!byId.has(answer.questionId)) {
        throw new BadRequestException(
          `Unknown questionId "${answer.questionId}" for this vacancy`,
        );
      }
    }

    const answersById = new Map(answers.map((a) => [a.questionId, a]));

    for (const question of questions) {
      const answer = answersById.get(question.id);

      if (question.required && (!answer || this.isBlank(answer.value))) {
        throw new BadRequestException(
          `Question "${question.label}" is required`,
        );
      }

      if (!answer || this.isBlank(answer.value)) continue;

      const options = question.options ?? [];

      if (question.type === VacancyQuestionType.SINGLE_CHOICE) {
        if (!options.includes(answer.value as string)) {
          throw new BadRequestException(
            `"${String(answer.value)}" is not an option for "${question.label}"`,
          );
        }
      }

      if (question.type === VacancyQuestionType.MULTI_CHOICE) {
        const values = Array.isArray(answer.value) ? answer.value : [answer.value];
        const invalid = values.find((v) => !options.includes(v as string));
        if (invalid !== undefined) {
          throw new BadRequestException(
            `"${String(invalid)}" is not an option for "${question.label}"`,
          );
        }
      }
    }

    return answers.map((answer) => {
      let value = answer.value ?? null;

      // The number input posts a string - coerce rather than reject.
      if (
        answer.type === VacancyQuestionType.NUMBER &&
        typeof value === "string" &&
        value.trim() !== "" &&
        !Number.isNaN(Number(value))
      ) {
        value = Number(value);
      }

      return {
        questionId: answer.questionId,
        label: answer.label,
        type: answer.type,
        value,
        fileId: answer.fileId ?? null,
      };
    }) as Prisma.InputJsonValue;
  }

  async createVacancy(
    createVacancyDto: CreateVacancyDto,
    ctx?: RequestContext,
  ): Promise<VacancyResponseDto> {
    const vacancy = await this.prisma.vacancy.create({
      data: {
        title: createVacancyDto.title,
        openings: createVacancyDto.openings ?? 1,
        duration: createVacancyDto.duration,
        hoursPerWeek: createVacancyDto.hoursPerWeek,
        overview: createVacancyDto.overview,
        responsibilities: createVacancyDto.responsibilities ?? [],
        requirements: createVacancyDto.requirements ?? [],
        location: createVacancyDto.location,
        type: createVacancyDto.type,
        deadline: createVacancyDto.deadline
          ? new Date(createVacancyDto.deadline)
          : null,
        isActive: createVacancyDto.isActive ?? true,
        isDraft: createVacancyDto.isDraft ?? false,
        questions: this.normalizeQuestions(createVacancyDto.questions ?? []),
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    const _v = plainToInstance(VacancyResponseDto, vacancy);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.CREATE,
        ActivityEntity.VACANCY,
        _v.id,
        _v.title,
      );
    }
    return _v;
  }

  async findAllVacancies(
    searchInput: VacancySearchInput,
  ): Promise<{ vacancies: VacancyResponseDto[]; total: number }> {
    const { offset = 0, limit = 10, search, isActive, type } = searchInput;

    const where: Prisma.VacancyWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          overview: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    if (type) {
      where.type = type;
    }

    const [vacancies, total] = await Promise.all([
      this.prisma.vacancy.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      this.prisma.vacancy.count({ where }),
    ]);

    return {
      vacancies: plainToInstance(
        VacancyResponseDto,
        vacancies,
      ) as unknown as VacancyResponseDto[],
      total,
    };
  }

  async findVacancyById(id: string): Promise<VacancyResponseDto> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    return plainToInstance(VacancyResponseDto, vacancy);
  }

  async updateVacancy(
    id: string,
    updateVacancyDto: UpdateVacancyDto,
    ctx?: RequestContext,
  ): Promise<VacancyResponseDto> {
    const existing = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    // Pulled out of the spread: `questions: []` means "clear every question",
    // which a plain spread of an absent-vs-empty field would get wrong.
    const { questions, ...rest } = updateVacancyDto;

    const vacancy = await this.prisma.vacancy.update({
      where: { id },
      data: {
        ...rest,
        deadline: updateVacancyDto.deadline
          ? new Date(updateVacancyDto.deadline)
          : updateVacancyDto.deadline === null
            ? null
            : existing.deadline,
        // undefined -> Prisma skips the column, leaving the stored set intact.
        ...(questions === undefined
          ? {}
          : { questions: this.normalizeQuestions(questions) }),
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    const _v = plainToInstance(VacancyResponseDto, vacancy);
    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.UPDATE,
        ActivityEntity.VACANCY,
        _v.id,
        _v.title,
      );
    }
    return _v;
  }

  async deleteVacancy(id: string, ctx?: RequestContext): Promise<void> {
    const existing = await this.prisma.vacancy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existing) {
      throw new NotFoundException(`Vacancy with ID ${id} not found`);
    }

    await this.prisma.vacancy.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    if (ctx) {
      this.activityLogService.logActivity(
        ctx,
        ActivityAction.DELETE,
        ActivityEntity.VACANCY,
        id,
        existing.title,
      );
    }
  }

  async applyToVacancy(
    vacancyId: string,
    dto: CreateVacancyApplicationDto,
  ): Promise<VacancyApplicationResponseDto> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id: vacancyId, deletedAt: null, isActive: true },
    });

    if (!vacancy) {
      throw new NotFoundException(
        `Active vacancy with ID ${vacancyId} not found or closed`,
      );
    }

    if (vacancy.isDraft) {
      throw new BadRequestException(
        `Vacancy with ID ${vacancyId} is not open for applications`,
      );
    }

    if (vacancy.deadline && vacancy.deadline.getTime() < Date.now()) {
      throw new BadRequestException(
        `The application deadline for this vacancy has passed`,
      );
    }

    const answers = this.normalizeAnswers(
      dto.answers ?? [],
      this.readQuestions(vacancy.questions),
    );

    const application = await this.prisma.vacancyApplication.create({
      data: {
        vacancyId,
        fullName: dto.fullName,
        email: dto.email,
        contact: dto.contact ?? null,
        currentAddress: dto.currentAddress,
        message: dto.message ?? null,
        cvUrl: dto.cvUrl,
        answers,
      },
    });

    return plainToInstance(VacancyApplicationResponseDto, application);
  }

  async findVacancyApplications(
    vacancyId: string,
  ): Promise<VacancyApplicationResponseDto[]> {
    const vacancy = await this.prisma.vacancy.findFirst({
      where: { id: vacancyId, deletedAt: null },
    });

    if (!vacancy) {
      throw new NotFoundException(`Vacancy with ID ${vacancyId} not found`);
    }

    const applications = await this.prisma.vacancyApplication.findMany({
      where: { vacancyId },
      orderBy: { createdAt: "desc" },
    });

    return plainToInstance(VacancyApplicationResponseDto, applications);
  }

  async updateApplicationStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
  ): Promise<VacancyApplicationResponseDto> {
    const existing = await this.prisma.vacancyApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    const application = await this.prisma.vacancyApplication.update({
      where: { id: applicationId },
      data: { status: dto.status },
    });

    return plainToInstance(VacancyApplicationResponseDto, application);
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const existing = await this.prisma.vacancyApplication.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Application with ID ${applicationId} not found`,
      );
    }

    await this.prisma.vacancyApplication.delete({
      where: { id: applicationId },
    });
  }
}
