import { app } from "./app.js";
import { env } from "./env/index.js";
import { initializeSchema } from "./lib/pg/init-schema.js";

async function start() {
  await initializeSchema();
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  console.log(`Server executando na porta ${env.PORT}`);
}

start().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err);
  process.exit(1);
});
