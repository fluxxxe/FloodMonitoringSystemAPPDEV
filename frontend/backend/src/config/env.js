const DEFAULT_PORT = 4000;

function parsePort(value) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT;
}

export const env = {
  port: parsePort(process.env.PORT),
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
};
