import OpenAI, { AzureOpenAI } from "openai";

export class AiConfigError extends Error {}

let cached = null;

/**
 * Returns a client for the Azure OpenAI deployment configured in server/.env.
 *
 * With AZURE_OPENAI_API_VERSION set, the classic deployment-scoped Azure API is used.
 * Without it, requests go to Azure's version-less v1 API ({endpoint}/openai/v1/).
 */
export function getAzureOpenAI() {
  if (cached) return cached;

  const endpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/openai(\/v1)?$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim();

  const missing = [
    !endpoint && "AZURE_OPENAI_ENDPOINT",
    !apiKey && "AZURE_OPENAI_API_KEY",
    !deployment && "AZURE_OPENAI_DEPLOYMENT",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new AiConfigError(`Azure OpenAI is not configured. Missing ${missing.join(", ")} in server/.env.`);
  }

  const client = apiVersion
    ? new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment })
    : new OpenAI({ apiKey, baseURL: `${endpoint}/openai/v1/` });

  cached = {
    client,
    model: deployment,
    reasoningEffort: process.env.AZURE_OPENAI_REASONING_EFFORT?.trim() || "low",
  };
  return cached;
}
