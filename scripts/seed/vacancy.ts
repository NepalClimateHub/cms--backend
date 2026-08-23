import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const seedSampleVacancy = async () => {
  const existing = await prisma.vacancy.findFirst({
    where: { title: "QA Engineer" },
  });

  if (existing) {
    console.log("Sample QA Engineer vacancy already exists.");
    return;
  }

  await prisma.vacancy.create({
    data: {
      title: "QA Engineer",
      openings: 1,
      duration: "6 months",
      hoursPerWeek: "5 hours/week",
      overview:
        "Help ensure Nepal Climate Hub delivers reliable, user-friendly, and high-quality digital products by leading quality assurance across our website, CMS, and future platforms.",
      responsibilities: [
        "Develop and maintain QA processes, test plans, and testing documentation.",
        "Test our website and CMS for functionality, usability, accessibility, responsiveness, and performance.",
        "Identify, document, prioritize, and track bugs, working closely with developers until issues are resolved.",
        "Perform regression testing before releases to ensure new updates do not introduce issues.",
        "Review new features and provide feedback to improve user experience and product quality.",
        "Proactively identify risks, edge cases, and opportunities for improvement throughout development.",
        "Help establish quality standards and testing best practices across the organization.",
        "Take ownership of product quality and ensure our public-facing platforms meet a high standard before launch.",
      ],
      requirements: [
        "Experience with software testing, quality assurance, or a related field.",
        "Understanding of manual testing methodologies; knowledge of automated testing is a plus.",
        "Strong attention to detail and ability to identify edge cases and usability issues.",
        "Ability to clearly document bugs and communicate effectively with developers.",
        "Highly self-driven, proactive, and able to work independently with minimal supervision.",
        "Strong ownership mindset with a commitment to delivering high-quality products.",
        "Interest in climate action, youth, or social impact.",
      ],
      type: "Volunteer / Part-Time",
      location: "Kathmandu / Remote",
      isActive: true,
      isDraft: false,
    },
  });

  console.log("Created sample QA Engineer vacancy.");
};
