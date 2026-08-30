import "reflect-metadata";
import {
  ClimateAggregation,
  ClimateGrain,
  ClimateVisualType,
} from "../dtos/climate-data.dto";
import { ClimateDataService } from "./climate-data.service";

describe("ClimateDataService structured queries", () => {
  const dataset = {
    id: "dataset-1",
    code: "NOAA_GSOM",
    name: "NOAA GSOM",
    source_url: "https://www.ncei.noaa.gov/",
    last_synced_at: new Date(),
  };
  const station = (id: string, name: string, value: number) => ({
    id,
    name,
    country_code: "NP",
    country_name: "Nepal",
    latitude: 27 + value / 100,
    longitude: 85 + value / 100,
    elevation_m: 1000,
  });
  const observations = [
    ...Array.from({ length: 24 }, (_, index) => ({
      station_id: "NP000000001",
      indicator_code: "TAVG",
      period: new Date(Date.UTC(2023 + Math.floor(index / 12), index % 12, 1)),
      value: 10,
      unit: "degC",
      station: station("NP000000001", "Station A", 10),
    })),
    ...Array.from({ length: 24 }, (_, index) => ({
      station_id: "NP000000002",
      indicator_code: "TAVG",
      period: new Date(Date.UTC(2023 + Math.floor(index / 12), index % 12, 1)),
      value: 20,
      unit: "degC",
      station: station("NP000000002", "Station B", 20),
    })),
  ];

  function serviceWith(rows: any[]) {
    const prisma: any = {
      climate_datasets: { upsert: jest.fn().mockResolvedValue(dataset) },
      climate_indicators: { upsert: jest.fn().mockResolvedValue({}) },
      climate_monthly_observations: { findMany: jest.fn().mockResolvedValue(rows) },
      climate_normals: { findMany: jest.fn().mockResolvedValue([]) },
    };
    return new ClimateDataService(prisma, {} as any, { get: jest.fn() } as any);
  }

  it("uses complete annual station records and labels the country median", async () => {
    const result = await serviceWith(observations).queryStructured({
      locations: ["Nepal"],
      indicators: ["TAVG"],
      startPeriod: "2023-01",
      endPeriod: "2024-12",
      grain: ClimateGrain.YEAR,
      aggregation: ClimateAggregation.MEDIAN_STATION,
      visualType: ClimateVisualType.TIMESERIES,
      limit: 500,
    });
    expect(result.visual!.type).toBe("climate_timeseries");
    expect((result.visual as any).series[0]).toEqual({
      name: "Nepal - TAVG",
      sourceIndex: 1,
      points: [
        { period: "2023", value: 15, coverage: 2 },
        { period: "2024", value: 15, coverage: 2 },
      ],
    });
    expect(result.answer).toContain("median among eligible stations");
    expect(result.answer).toContain("not an area-weighted national estimate");
  });

  it("computes scatter correlation only with at least ten stations", async () => {
    const rows = Array.from({ length: 10 }, (_, index) => {
      const current = station(`NP0000000${String(index).padStart(2, "0")}`, `Station ${index}`, index);
      return [
        {
          station_id: current.id,
          indicator_code: "TAVG",
          period: new Date("2024-01-01T00:00:00Z"),
          value: index + 1,
          unit: "degC",
          station: current,
        },
        {
          station_id: current.id,
          indicator_code: "PRCP",
          period: new Date("2024-01-01T00:00:00Z"),
          value: (index + 1) * 2,
          unit: "mm",
          station: current,
        },
      ];
    }).flat();
    const result = await serviceWith(rows).queryStructured({
      locations: ["Nepal"],
      indicators: ["TAVG", "PRCP"],
      startPeriod: "2024-01",
      endPeriod: "2024-01",
      grain: ClimateGrain.MONTH,
      aggregation: ClimateAggregation.MEDIAN_STATION,
      visualType: ClimateVisualType.SCATTER,
      limit: 500,
    });
    expect((result.visual as any).correlation).toBe(1);
    expect((result.visual as any).points).toHaveLength(10);
  });

  it("caches identical structured queries without changing their values", async () => {
    const service = serviceWith(observations);
    const dto = {
      locations: ["Nepal"],
      indicators: ["TAVG"],
      startPeriod: "2023-01",
      endPeriod: "2024-12",
      grain: ClimateGrain.YEAR,
      aggregation: ClimateAggregation.MEDIAN_STATION,
      visualType: ClimateVisualType.TIMESERIES,
      limit: 500,
    };
    const first = await service.queryStructured(dto);
    const second = await service.queryStructured(dto);
    expect(first.summary.cacheHit).toBeUndefined();
    expect(second.summary.cacheHit).toBe(true);
    expect(second.visual).toEqual(first.visual);
  });
});
