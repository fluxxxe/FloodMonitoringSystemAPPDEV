export interface ActiveAlert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "danger" | "info";
}

export const activeAlerts: ActiveAlert[] = [
  {
    id: "a1",
    title: "High Water Level",
    message: "Central Dam water level is approaching maximum capacity.",
    type: "danger",
  },
  {
    id: "a2",
    title: "Heavy Rainfall Expected",
    message: "Weather forecast shows heavy rain in the next 6 hours.",
    type: "warning",
  },
  {
    id: "a3",
    title: "Tsunami Alert",
    message: "Tsunami warning issued for coastal areas.",
    type: "danger",
  },
];

