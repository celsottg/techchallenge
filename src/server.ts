import { app } from "./app.js";
import { env } from "./env/index.js";

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log(`Server executando na porta ${env.PORT}`);
});
