export function getHealth(_req, res) {
  res.json({
    status: "ok",
    service: "flood-monitoring-backend",
    timestamp: new Date().toISOString(),
  });
}
