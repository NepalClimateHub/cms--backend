import { ClimateOntologyConceptType } from "@prisma/client";
import {
  ClimateOntologyService,
  normalizeOntologyAlias,
} from "./climate-ontology.service";

describe("ClimateOntologyService", () => {
  it("normalizes harmless punctuation and spacing differences", () => {
    expect(normalizeOntologyAlias("  Nepal's   NDC! ")).toBe("nepal s ndc");
  });

  it("resolves aliases only inside the active ontology version", async () => {
    const concept = {
      key: "indicator:prcp",
      type: ClimateOntologyConceptType.INDICATOR,
      canonical_name: "Precipitation",
      external_ref: "PRCP",
      metadata: { indicatorCode: "PRCP" },
    };
    const prisma: any = {
      climate_ontology_concepts: { findFirst: jest.fn().mockResolvedValue(concept) },
    };
    const service = new ClimateOntologyService(prisma);
    await expect(
      service.resolve(" Rain-fall ", [ClimateOntologyConceptType.INDICATOR]),
    ).resolves.toEqual(concept);
    expect(prisma.climate_ontology_concepts.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          version: { active: true },
          aliases: { some: { normalized_alias: "rain fall", language: "en" } },
        }),
      }),
    );
  });

  it("exports concepts and typed relationships without observations", async () => {
    const prisma: any = {
      climate_ontology_versions: {
        findFirst: jest.fn().mockResolvedValue({
          version: 1,
          checksum: "abc",
          concepts: [
            {
              key: "indicator:prcp",
              type: ClimateOntologyConceptType.INDICATOR,
              canonical_name: "Precipitation",
              description: "Monthly precipitation.",
              external_ref: "PRCP",
              metadata: { indicatorCode: "PRCP" },
              aliases: [{ alias: "rainfall" }],
            },
          ],
          relationships: [
            {
              source: { key: "indicator:prcp" },
              predicate: "INDICATOR_TO_DATASET",
              target: { key: "dataset:noaa-gsom" },
            },
          ],
        }),
      },
    };
    const result = await new ClimateOntologyService(prisma).exportActive();
    expect(result.concepts[0]).toEqual(
      expect.objectContaining({ canonicalName: "Precipitation", aliases: ["rainfall"] }),
    );
    expect(result.relationships[0]).toEqual({
      source: "indicator:prcp",
      predicate: "INDICATOR_TO_DATASET",
      target: "dataset:noaa-gsom",
    });
    expect(result.concepts[0]).not.toHaveProperty("observations");
  });
});
