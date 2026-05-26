export interface WaterReading {
  timestamp: string;
  level: number;
}

export interface MonitoredWater {
  id: string;
  locationName: string;
  locationType: "River" | "Creek" | "Canal";
  barangay: string;
  municipality: string;
  currentLevel: number;
  maxLevel: number;
  status: "Safe" | "Warning" | "Danger";
  sensorId: string;
  trend: "Rising" | "Stable" | "Falling";
  lastUpdated: string;
  notes: string;
  imageUrl: string;
  readings: WaterReading[];
}

export const monitoredWaters: MonitoredWater[] = [
  {
    id: "cdr-river",
    locationName: "Cagayan De Oro River",
    locationType: "River",
    barangay: "Macasandig",
    municipality: "Cagayan de Oro",
    currentLevel: 8.0,
    maxLevel: 10.0,
    status: "Danger",
    sensorId: "TSU-001",
    trend: "Rising",
    lastUpdated: "09:12 AM",
    notes: "Rapid increase after heavy rainfall upstream.",
    imageUrl: "/waters/cagayan-de-oro-river.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 4.7 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 5.1 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 5.8 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 6.2 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 6.9 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 7.1 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 7.4 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 7.7 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 8.0 },
    ],
  },
  {
    id: "bigaan-river",
    locationName: "Bigaan River",
    locationType: "River",
    barangay: "Bigaan",
    municipality: "Cagayan de Oro",
    currentLevel: 4.1,
    maxLevel: 8.0,
    status: "Safe",
    sensorId: "FLD-002",
    trend: "Stable",
    lastUpdated: "09:08 AM",
    notes: "Within normal range for this time.",
    imageUrl: "/waters/bigaan-river.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 3.8 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 3.9 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 4.0 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 4.1 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 4.2 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 4.0 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 4.1 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 4.0 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 4.1 },
    ],
  },
  {
    id: "bitanag-creek",
    locationName: "Bitan-ag Creek",
    locationType: "Creek",
    barangay: "Bitan-ag",
    municipality: "Cagayan de Oro",
    currentLevel: 7.0,
    maxLevel: 10.0,
    status: "Warning",
    sensorId: "FLD-003",
    trend: "Rising",
    lastUpdated: "09:11 AM",
    notes: "Approaching warning threshold due to runoff.",
    imageUrl: "/waters/bitan-ag-creek.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 5.2 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 5.5 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 5.9 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 6.1 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 6.4 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 6.6 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 6.8 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 6.9 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 7.0 },
    ],
  },
  {
    id: "kauswagan-canal",
    locationName: "Kauswagan Canal",
    locationType: "Canal",
    barangay: "Kauswagan",
    municipality: "Cagayan de Oro",
    currentLevel: 3.5,
    maxLevel: 7.0,
    status: "Safe",
    sensorId: "FLD-004",
    trend: "Falling",
    lastUpdated: "09:05 AM",
    notes: "Water is draining after early morning rain.",
    imageUrl: "/waters/kauswagan-canal.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 4.8 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 4.6 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 4.4 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 4.2 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 4.0 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 3.9 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 3.7 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 3.6 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 3.5 },
    ],
  },
  {
    id: "taguanao-creek",
    locationName: "Taguanao Creek",
    locationType: "Creek",
    barangay: "Taguanao",
    municipality: "Cagayan de Oro",
    currentLevel: 6.9,
    maxLevel: 9.0,
    status: "Warning",
    sensorId: "FLD-005",
    trend: "Stable",
    lastUpdated: "09:10 AM",
    notes: "Sustained high flow along low-lying sections.",
    imageUrl: "/waters/taguanao-creek.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 6.4 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 6.6 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 6.8 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 6.9 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 7.0 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 6.9 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 6.8 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 6.9 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 6.9 },
    ],
  },
  {
    id: "iponan-river",
    locationName: "Iponan River",
    locationType: "River",
    barangay: "Iponan",
    municipality: "Cagayan de Oro",
    currentLevel: 9.2,
    maxLevel: 10.5,
    status: "Danger",
    sensorId: "TSU-006",
    trend: "Rising",
    lastUpdated: "09:14 AM",
    notes: "Strong upstream inflow; evacuation team notified.",
    imageUrl: "/waters/iponan-river.jpg",
    readings: [
      { timestamp: "2026-03-30T09:00:00+08:00", level: 6.0 },
      { timestamp: "2026-03-30T12:00:00+08:00", level: 6.3 },
      { timestamp: "2026-03-30T15:00:00+08:00", level: 6.7 },
      { timestamp: "2026-03-30T18:00:00+08:00", level: 7.4 },
      { timestamp: "2026-03-30T21:00:00+08:00", level: 7.9 },
      { timestamp: "2026-03-31T00:00:00+08:00", level: 8.3 },
      { timestamp: "2026-03-31T03:00:00+08:00", level: 8.7 },
      { timestamp: "2026-03-31T06:00:00+08:00", level: 9.0 },
      { timestamp: "2026-03-31T09:00:00+08:00", level: 9.2 },
    ],
  },
];
