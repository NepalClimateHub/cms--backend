import { ConflictException, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClimateOntologyConceptType, Prisma } from "@prisma/client";
import { createHash } from "crypto";
import { PrismaService } from "../../shared/prisma-module/prisma.service";

type SeedConcept = {
  key: string;
  type: ClimateOntologyConceptType;
  canonicalName: string;
  description: string;
  aliases: string[];
  externalRef?: string;
  metadata?: Prisma.InputJsonObject;
};

type SeedRelationship = {
  source: string;
  predicate: string;
  target: string;
};

const ONTOLOGY_VERSION = 1;

const COUNTRIES = [
  ["AF", "Afghanistan", ["AFG"]],
  ["BG", "Bangladesh", ["BD", "BGD"]],
  ["BT", "Bhutan", ["BTN"]],
  ["IN", "India", ["IND"]],
  ["MV", "Maldives", ["MDV"]],
  ["NP", "Nepal", ["NPL"]],
  ["PK", "Pakistan", ["PAK"]],
  ["CE", "Sri Lanka", ["SL", "LKA", "Ceylon"]],
] as const;

const BASE_CONCEPTS: SeedConcept[] = [
  ...COUNTRIES.map(([code, name, aliases]) => ({
    key: `location:${code.toLowerCase()}`,
    type: ClimateOntologyConceptType.LOCATION,
    canonicalName: name,
    description: `${name}, a South Asian country in the climate-data coverage area.`,
    aliases: [code, ...aliases],
    externalRef: code,
    metadata: { countryCode: code },
  })),
  {
    key: "dataset:noaa-gsom",
    type: ClimateOntologyConceptType.DATASET,
    canonicalName: "NOAA Global Summary of the Month",
    description: "NOAA monthly station observations used for temperature and precipitation analysis.",
    aliases: ["NOAA GSOM", "GSOM", "global summary of the month"],
    externalRef: "NOAA_GSOM",
    metadata: { datasetCode: "NOAA_GSOM" },
  },
  {
    key: "indicator:tavg",
    type: ClimateOntologyConceptType.INDICATOR,
    canonicalName: "Average temperature",
    description: "Monthly mean air temperature in degrees Celsius.",
    aliases: ["TAVG", "mean temperature", "average heat", "average temperature", "temperature"],
    externalRef: "TAVG",
    metadata: { indicatorCode: "TAVG", unit: "degC" },
  },
  {
    key: "indicator:tmin",
    type: ClimateOntologyConceptType.INDICATOR,
    canonicalName: "Minimum temperature",
    description: "Monthly mean of daily minimum air temperature in degrees Celsius.",
    aliases: ["TMIN", "minimum temperature", "min temperature", "night temperature"],
    externalRef: "TMIN",
    metadata: { indicatorCode: "TMIN", unit: "degC" },
  },
  {
    key: "indicator:tmax",
    type: ClimateOntologyConceptType.INDICATOR,
    canonicalName: "Maximum temperature",
    description: "Monthly mean of daily maximum air temperature in degrees Celsius.",
    aliases: ["TMAX", "maximum temperature", "max temperature", "daytime heat"],
    externalRef: "TMAX",
    metadata: { indicatorCode: "TMAX", unit: "degC" },
  },
  {
    key: "indicator:prcp",
    type: ClimateOntologyConceptType.INDICATOR,
    canonicalName: "Precipitation",
    description: "Monthly accumulated liquid-equivalent precipitation in millimetres.",
    aliases: ["PRCP", "rain", "rainfall", "precipitation", "monthly rain"],
    externalRef: "PRCP",
    metadata: { indicatorCode: "PRCP", unit: "mm" },
  },
  {
    key: "unit:degc",
    type: ClimateOntologyConceptType.UNIT,
    canonicalName: "degrees Celsius",
    description: "Temperature unit used by normalized GSOM observations.",
    aliases: ["degC", "Celsius", "degrees C"],
    metadata: { unit: "degC" },
  },
  {
    key: "unit:mm",
    type: ClimateOntologyConceptType.UNIT,
    canonicalName: "millimetres",
    description: "Precipitation depth unit used by normalized GSOM observations.",
    aliases: ["mm", "millimeter", "millimetre"],
    metadata: { unit: "mm" },
  },
  {
    key: "sector:energy",
    type: ClimateOntologyConceptType.SECTOR,
    canonicalName: "Energy",
    description: "Climate policy sector covering electricity, fuels, efficiency, and renewable energy.",
    aliases: ["energy sector", "power sector", "renewable energy"],
  },
  {
    key: "sector:agriculture",
    type: ClimateOntologyConceptType.SECTOR,
    canonicalName: "Agriculture",
    description: "Climate policy sector covering farming, food systems, and agricultural resilience.",
    aliases: ["agriculture sector", "farming", "food systems"],
  },
  {
    key: "sector:transport",
    type: ClimateOntologyConceptType.SECTOR,
    canonicalName: "Transport",
    description: "Climate policy sector covering mobility, vehicles, and transport infrastructure.",
    aliases: ["transportation", "mobility sector"],
  },
  {
    key: "sector:forestry",
    type: ClimateOntologyConceptType.SECTOR,
    canonicalName: "Forestry and land use",
    description: "Climate policy sector covering forests, land use, and carbon sinks.",
    aliases: ["forestry", "forest sector", "land use", "LULUCF"],
  },
  {
    key: "policy:nepal-ndc",
    type: ClimateOntologyConceptType.POLICY,
    canonicalName: "Nepal Nationally Determined Contribution",
    description: "Nepal's climate commitments submitted under the Paris Agreement.",
    aliases: ["Nepal NDC", "Nepal's NDC", "nationally determined contribution of Nepal"],
  },
  {
    key: "target:renewable-energy",
    type: ClimateOntologyConceptType.TARGET,
    canonicalName: "Renewable energy target",
    description: "A policy commitment that specifies a future renewable-energy outcome.",
    aliases: ["renewables target", "clean energy target"],
  },
  {
    key: "term:climate-normal",
    type: ClimateOntologyConceptType.TERM,
    canonicalName: "Climate normal",
    description: "A long-period reference average; this application uses 1991-2020 where coverage is sufficient.",
    aliases: ["normal", "baseline average", "1991-2020 baseline"],
  },
  {
    key: "term:anomaly",
    type: ClimateOntologyConceptType.TERM,
    canonicalName: "Climate anomaly",
    description: "The difference between an observation and its eligible climate normal.",
    aliases: ["anomaly", "departure from normal", "difference from baseline"],
  },
];

const BASE_RELATIONSHIPS: SeedRelationship[] = [
  ...["tavg", "tmin", "tmax", "prcp"].map((indicator) => ({
    source: `indicator:${indicator}`,
    predicate: "INDICATOR_TO_DATASET",
    target: "dataset:noaa-gsom",
  })),
  { source: "indicator:tavg", predicate: "MEASURED_IN", target: "unit:degc" },
  { source: "indicator:tmin", predicate: "MEASURED_IN", target: "unit:degc" },
  { source: "indicator:tmax", predicate: "MEASURED_IN", target: "unit:degc" },
  { source: "indicator:prcp", predicate: "MEASURED_IN", target: "unit:mm" },
  { source: "policy:nepal-ndc", predicate: "POLICY_TO_LOCATION", target: "location:np" },
  { source: "target:renewable-energy", predicate: "TARGET_TO_SECTOR", target: "sector:energy" },
  { source: "policy:nepal-ndc", predicate: "POLICY_HAS_TARGET", target: "target:renewable-energy" },
];

export function normalizeOntologyAlias(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

@Injectable()
export class ClimateOntologyService implements OnModuleInit {
  private readonly logger = new Logger(ClimateOntologyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.seed();
    } catch (error) {
      this.logger.warn(
        `Climate ontology is not ready: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private checksum() {
    return createHash("sha256")
      .update(JSON.stringify({ concepts: BASE_CONCEPTS, relationships: BASE_RELATIONSHIPS }))
      .digest("hex");
  }

  async seed() {
    const checksum = this.checksum();
    const existing = await this.prisma.climate_ontology_versions.findUnique({
      where: { version: ONTOLOGY_VERSION },
    });
    if (existing && existing.checksum !== checksum) {
      throw new ConflictException(
        `Ontology version ${ONTOLOGY_VERSION} already exists with a different checksum; create a new version`,
      );
    }

    const version = await this.prisma.climate_ontology_versions.upsert({
      where: { version: ONTOLOGY_VERSION },
      create: {
        version: ONTOLOGY_VERSION,
        checksum,
        active: true,
        notes: "Initial South Asia climate-chat ontology",
      },
      update: { active: true },
    });
    await this.prisma.climate_ontology_versions.updateMany({
      where: { id: { not: version.id }, active: true },
      data: { active: false },
    });

    const stations = await this.prisma.climate_stations.findMany({
      select: { id: true, name: true, country_code: true },
      orderBy: { id: "asc" },
    });
    const stationConcepts: SeedConcept[] = stations.map((station) => ({
      key: `station:${station.id.toLowerCase()}`,
      type: ClimateOntologyConceptType.STATION,
      canonicalName: station.name,
      description: `NOAA station ${station.name} (${station.id}) in ${station.country_code}.`,
      aliases: [station.id],
      externalRef: station.id,
      metadata: { stationId: station.id, countryCode: station.country_code },
    }));
    const concepts = [...BASE_CONCEPTS, ...stationConcepts];
    const byKey = new Map<string, { id: string }>();
    for (const concept of concepts) {
      const saved = await this.prisma.climate_ontology_concepts.upsert({
        where: { version_id_key: { version_id: version.id, key: concept.key } },
        create: {
          version_id: version.id,
          key: concept.key,
          type: concept.type,
          canonical_name: concept.canonicalName,
          description: concept.description,
          external_ref: concept.externalRef,
          metadata: concept.metadata || {},
        },
        update: {
          type: concept.type,
          canonical_name: concept.canonicalName,
          description: concept.description,
          external_ref: concept.externalRef,
          metadata: concept.metadata || {},
        },
        select: { id: true },
      });
      byKey.set(concept.key, saved);
    }

    const conflicts: Array<{ alias: string; existingConceptId: string; requestedKey: string }> = [];
    for (const concept of concepts) {
      const conceptId = byKey.get(concept.key)!.id;
      const aliases = [...new Set([concept.canonicalName, ...concept.aliases])];
      for (const alias of aliases) {
        const normalized = normalizeOntologyAlias(alias);
        const claimed = await this.prisma.climate_ontology_aliases.findFirst({
          where: { version_id: version.id, normalized_alias: normalized, language: "en" },
        });
        if (claimed && claimed.concept_id !== conceptId) {
          conflicts.push({ alias, existingConceptId: claimed.concept_id, requestedKey: concept.key });
          continue;
        }
        await this.prisma.climate_ontology_aliases.upsert({
          where: {
            version_id_normalized_alias_language: {
              version_id: version.id,
              normalized_alias: normalized,
              language: "en",
            },
          },
          create: {
            version_id: version.id,
            concept_id: conceptId,
            alias,
            normalized_alias: normalized,
          },
          update: { alias, concept_id: conceptId },
        });
      }
    }

    const relationships = [
      ...BASE_RELATIONSHIPS,
      ...stationConcepts.map((station) => ({
        source: station.key,
        predicate: "STATION_TO_LOCATION",
        target: `location:${String(station.metadata?.countryCode).toLowerCase()}`,
      })),
    ];
    for (const relationship of relationships) {
      const source = byKey.get(relationship.source);
      const target = byKey.get(relationship.target);
      if (!source || !target) continue;
      await this.prisma.climate_ontology_relationships.upsert({
        where: {
          version_id_source_id_predicate_target_id: {
            version_id: version.id,
            source_id: source.id,
            predicate: relationship.predicate,
            target_id: target.id,
          },
        },
        create: {
          version_id: version.id,
          source_id: source.id,
          predicate: relationship.predicate,
          target_id: target.id,
        },
        update: {},
      });
    }

    return {
      version: version.version,
      checksum,
      concepts: concepts.length,
      relationships: relationships.length,
      conflicts,
    };
  }

  async resolve(value: string, types: ClimateOntologyConceptType[]) {
    const normalized = normalizeOntologyAlias(value);
    if (!normalized) return null;
    return this.prisma.climate_ontology_concepts.findFirst({
      where: {
        type: { in: types },
        version: { active: true },
        aliases: { some: { normalized_alias: normalized, language: "en" } },
      },
      select: {
        key: true,
        type: true,
        canonical_name: true,
        external_ref: true,
        metadata: true,
      },
    });
  }

  async exportActive() {
    const version = await this.prisma.climate_ontology_versions.findFirst({
      where: { active: true },
      orderBy: { version: "desc" },
      include: {
        concepts: {
          orderBy: [{ type: "asc" }, { canonical_name: "asc" }],
          include: { aliases: { orderBy: { normalized_alias: "asc" } } },
        },
        relationships: {
          orderBy: [{ predicate: "asc" }, { source_id: "asc" }],
          include: {
            source: { select: { key: true } },
            target: { select: { key: true } },
          },
        },
      },
    });
    if (!version) return { version: null, checksum: null, concepts: [], relationships: [] };
    return {
      version: version.version,
      checksum: version.checksum,
      concepts: version.concepts.map((concept) => ({
        key: concept.key,
        type: concept.type,
        canonicalName: concept.canonical_name,
        description: concept.description,
        externalRef: concept.external_ref,
        metadata: concept.metadata,
        aliases: concept.aliases.map((alias) => alias.alias),
      })),
      relationships: version.relationships.map((relationship) => ({
        source: relationship.source.key,
        predicate: relationship.predicate,
        target: relationship.target.key,
      })),
    };
  }
}
