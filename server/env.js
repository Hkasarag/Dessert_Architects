import { existsSync } from "node:fs";

// Load server settings before any module reads process.env.
// config.env holds the MongoDB settings; .env (git-ignored) holds secrets such as Azure OpenAI keys.
for (const name of ["./config.env", "./.env"]) {
  const file = new URL(name, import.meta.url);
  if (existsSync(file)) {
    process.loadEnvFile(file);
  }
}
