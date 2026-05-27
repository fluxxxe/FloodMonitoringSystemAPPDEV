import { monitoredWaters, MonitoredWater, WaterReading } from "../data/monitoredWaters";

function normalizeStatus(status: string): MonitoredWater["status"] {
  const s = status.toLowerCase();
  if (s === "warning") return "Warning";
  if (s === "danger") return "Danger";
  return "Safe";
}

function normalizeTrend(trend: string): MonitoredWater["trend"] {
  const t = trend.toLowerCase();
  if (t === "rising") return "Rising";
  if (t === "falling") return "Falling";
  return "Stable";
}

function findMetadata(locationName: string): MonitoredWater | undefined {
  const key = locationName.toLowerCase().trim();
  return monitoredWaters.find((w) => w.locationName.toLowerCase() === key);
}

function formatLastUpdated(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function normalizeWaterRow(row: Record<string, unknown>): MonitoredWater {
  const meta = findMetadata(String(row.locationName ?? ""));
  const currentLevel = parseFloat(String(row.currentLevel ?? 0));
  const maxLevel = parseFloat(String(row.maxLevel ?? meta?.maxLevel ?? 10));

  return {
    id: String(row.id ?? meta?.id ?? row.locationName),
    locationName: String(row.locationName ?? meta?.locationName ?? "Unknown"),
    locationType: meta?.locationType ?? "River",
    barangay: meta?.barangay ?? "—",
    municipality: meta?.municipality ?? "Cagayan de Oro",
    currentLevel: Number.isNaN(currentLevel) ? meta?.currentLevel ?? 0 : currentLevel,
    maxLevel: Number.isNaN(maxLevel) ? meta?.maxLevel ?? 10 : maxLevel,
    status: normalizeStatus(String(row.status ?? meta?.status ?? "Safe")),
    sensorId: meta?.sensorId ?? `SNS-${row.id ?? "000"}`,
    trend: normalizeTrend(String(row.trend ?? meta?.trend ?? "Stable")),
    lastUpdated: formatLastUpdated(row.lastUpdated as string | undefined),
    notes: meta?.notes ?? "",
    imageUrl: meta?.imageUrl ?? "/location.png",
    readings: (meta?.readings ?? []) as WaterReading[],
  };
}

export function normalizeWatersList(rows: Record<string, unknown>[]): MonitoredWater[] {
  return rows.map(normalizeWaterRow);
}
