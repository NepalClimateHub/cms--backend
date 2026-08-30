CREATE TYPE "ClimateOntologyConceptType" AS ENUM (
  'LOCATION', 'STATION', 'DATASET', 'INDICATOR', 'SECTOR',
  'POLICY', 'TARGET', 'UNIT', 'TERM'
);

CREATE TABLE "climate_ontology_versions" (
  "id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_ontology_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_ontology_concepts" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "key" VARCHAR(160) NOT NULL,
  "type" "ClimateOntologyConceptType" NOT NULL,
  "canonical_name" VARCHAR(200) NOT NULL,
  "description" TEXT,
  "external_ref" VARCHAR(200),
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "climate_ontology_concepts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_ontology_aliases" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "concept_id" TEXT NOT NULL,
  "alias" VARCHAR(200) NOT NULL,
  "normalized_alias" VARCHAR(200) NOT NULL,
  "language" VARCHAR(12) NOT NULL DEFAULT 'en',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "climate_ontology_aliases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "climate_ontology_relationships" (
  "id" TEXT NOT NULL,
  "version_id" TEXT NOT NULL,
  "source_id" TEXT NOT NULL,
  "predicate" VARCHAR(80) NOT NULL,
  "target_id" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "climate_ontology_relationships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "climate_ontology_versions_version_key" ON "climate_ontology_versions"("version");
CREATE INDEX "climate_ontology_versions_active_idx" ON "climate_ontology_versions"("active");
CREATE UNIQUE INDEX "climate_ontology_concepts_version_id_key_key" ON "climate_ontology_concepts"("version_id", "key");
CREATE INDEX "climate_ontology_concepts_version_id_type_idx" ON "climate_ontology_concepts"("version_id", "type");
CREATE INDEX "climate_ontology_concepts_external_ref_idx" ON "climate_ontology_concepts"("external_ref");
CREATE UNIQUE INDEX "climate_ontology_aliases_version_id_normalized_alias_lang_key" ON "climate_ontology_aliases"("version_id", "normalized_alias", "language");
CREATE INDEX "climate_ontology_aliases_concept_id_idx" ON "climate_ontology_aliases"("concept_id");
CREATE UNIQUE INDEX "climate_ontology_relationships_version_source_predicate_key" ON "climate_ontology_relationships"("version_id", "source_id", "predicate", "target_id");
CREATE INDEX "climate_ontology_relationships_version_id_predicate_idx" ON "climate_ontology_relationships"("version_id", "predicate");
CREATE INDEX "climate_ontology_relationships_target_id_idx" ON "climate_ontology_relationships"("target_id");

ALTER TABLE "climate_ontology_concepts" ADD CONSTRAINT "climate_ontology_concepts_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "climate_ontology_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_ontology_aliases" ADD CONSTRAINT "climate_ontology_aliases_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "climate_ontology_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_ontology_aliases" ADD CONSTRAINT "climate_ontology_aliases_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "climate_ontology_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_ontology_relationships" ADD CONSTRAINT "climate_ontology_relationships_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "climate_ontology_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_ontology_relationships" ADD CONSTRAINT "climate_ontology_relationships_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "climate_ontology_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "climate_ontology_relationships" ADD CONSTRAINT "climate_ontology_relationships_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "climate_ontology_concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
