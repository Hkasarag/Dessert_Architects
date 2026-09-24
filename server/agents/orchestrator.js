import { getAzureOpenAI } from "../ai/azureClient.js";
import { currentSeason, today } from "./data.js";
import productRecommendation from "./productRecommendation.js";
import partyPlanner from "./partyPlanner.js";
import cartOptimization from "./cartOptimization.js";
import nutritionalAllergy from "./nutritionalAllergy.js";
import customerService from "./customerService.js";
import franchiseReordering from "./franchiseReordering.js";
import promotionRecommendation from "./promotionRecommendation.js";

export const AGENTS = [
  productRecommendation,
  partyPlanner,
  cartOptimization,
  nutritionalAllergy,
  customerService,
  franchiseReordering,
  promotionRecommendation,
];

const AGENTS_BY_ID = new Map(AGENTS.map(agent => [agent.id, agent]));

const ORCHESTRATOR = { id: "clarification_required", label: "Orchestrator Agent" };

const EXPERIENCE = {
  customer: {
    name: "AI Dessert Concierge",
    audience: "a bakery customer",
    tone: "Warm, friendly, and easy to read. Many customers are older adults, so use simple words and short sentences.",
    otherRoleMessage: "This capability is only available in the Franchise Operations Assistant.",
    fallbackQuestion: "I can help with dessert recommendations, party planning, your cart, allergies and dietary needs, or order support. What would you like help with?",
  },
  admin: {
    name: "Franchise Operations Assistant",
    audience: "a franchise owner or operations manager",
    tone: "Professional, concise, and numbers-first.",
    otherRoleMessage: "This capability is available in the Customer Dessert Concierge.",
    fallbackQuestion: "I can help with inventory reordering, purchase orders, promotions, or promotion simulations. What would you like?",
  },
};

const ROUTER_HISTORY_TURNS = 6;
const MAX_TOOL_ROUNDS = 4;

const routerSchema = {
  type: "object",
  properties: {
    agent: { type: "string", enum: [...AGENTS.map(agent => agent.id), ORCHESTRATOR.id] },
    confidence: { type: "number", description: "0 to 1." },
    rationale: { type: "string", description: "One sentence." },
    followUpQuestion: { type: "string", description: `A clarifying question when agent is ${ORCHESTRATOR.id}, otherwise an empty string.` },
  },
  required: ["agent", "confidence", "rationale", "followUpQuestion"],
  additionalProperties: false,
};

const routerPrompt = role => `You are the orchestrator behind Frosted Corner bakery's ${EXPERIENCE[role].name}. The person chatting is ${EXPERIENCE[role].audience}.
Choose the single specialist agent best suited to the latest user message. Use earlier turns for context: a follow-up such as "make it 20 guests" continues with the same agent.

Agents:
${AGENTS.map(agent => `- ${agent.id} (serves ${agent.role === "admin" ? "franchise admins" : "customers"}): ${agent.description}`).join("\n")}
- ${ORCHESTRATOR.id}: greetings, messages too vague to route, or requests unrelated to the bakery. Write a short, friendly followUpQuestion that steers toward what this assistant can do.

Pick the agent that fits the request even if it serves the other audience; access is enforced separately.`;

const agentPrompt = (agent, role, context) => `You are ${agent.name}, a specialist behind Frosted Corner bakery's ${EXPERIENCE[role].name}, talking with ${EXPERIENCE[role].audience}.
Today is ${today()}. The current season is ${currentSeason()}.

${agent.instructions}

Ground rules:
- Use only the reference data below and your tool results. Never invent products, prices, orders, policies, or numbers. If the data doesn't cover the question, say so plainly.
- Stay within your specialty. If asked for something outside it, briefly say what you can help with.
- Tone: ${EXPERIENCE[role].tone}
- Format for a plain-text chat bubble: no Markdown (no **, #, or tables). Use "• " bullets for lists. Format money like $3.50.
- Keep replies under about 150 words unless the user asks for more detail.

Reference data (JSON):
${JSON.stringify(context)}`;

const toolDefinitions = agent =>
  (agent.tools ?? []).map(tool => ({
    type: "function",
    function: { name: tool.name, description: tool.description, parameters: tool.parameters, strict: true },
  }));

async function routeMessage(role, history) {
  const { client, model, reasoningEffort } = getAzureOpenAI();
  const completion = await client.chat.completions.create({
    model,
    reasoning_effort: reasoningEffort,
    max_completion_tokens: 2000,
    response_format: { type: "json_schema", json_schema: { name: "agent_route", strict: true, schema: routerSchema } },
    messages: [{ role: "system", content: routerPrompt(role) }, ...history.slice(-ROUTER_HISTORY_TURNS)],
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content ?? "");
  } catch {
    return { agent: ORCHESTRATOR.id, confidence: 0, rationale: "The router returned an unreadable response.", followUpQuestion: "" };
  }
}

async function runTool(agent, call) {
  const tool = agent.tools?.find(t => t.name === call.function.name);
  if (!tool) return { error: `Unknown tool ${call.function.name}.` };
  try {
    return await tool.handler(JSON.parse(call.function.arguments || "{}"));
  } catch (error) {
    console.error(`Tool ${call.function.name} failed:`, error);
    return { error: "The tool failed to run." };
  }
}

async function runAgent(agent, role, history, requestContext) {
  const { client, model, reasoningEffort } = getAzureOpenAI();
  const context = await agent.buildContext(requestContext);
  const tools = toolDefinitions(agent);
  const messages = [{ role: "system", content: agentPrompt(agent, role, context) }, ...history];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const completion = await client.chat.completions.create({
      model,
      messages,
      reasoning_effort: reasoningEffort,
      max_completion_tokens: 6000,
      ...(tools.length > 0 && round < MAX_TOOL_ROUNDS ? { tools } : {}),
    });

    const choice = completion.choices[0];
    const reply = choice?.message;
    if (!reply) break;

    if (reply.tool_calls?.length) {
      messages.push(reply);
      for (const call of reply.tool_calls) {
        const result = await runTool(agent, call);
        messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(result) });
      }
      continue;
    }

    if (reply.content?.trim()) return reply.content.trim();
    if (choice.finish_reason === "length") {
      console.warn(`${agent.name} ran out of completion tokens before answering.`);
    }
    break;
  }

  return "Sorry, I couldn't put together an answer just now. Could you try asking again?";
}

/**
 * Routes the latest message to a specialist agent and returns its reply.
 * history: [{ role: "user" | "assistant", content }], ending with the user's latest message.
 */
export async function handleChat({ role, history, customerId, cart }) {
  const route = await routeMessage(role, history);
  const agent = AGENTS_BY_ID.get(route.agent);
  const routing = { confidence: route.confidence, rationale: route.rationale };

  if (!agent) {
    return {
      reply: route.followUpQuestion?.trim() || EXPERIENCE[role].fallbackQuestion,
      agent: { id: ORCHESTRATOR.id, label: ORCHESTRATOR.label },
      routing,
    };
  }

  // Customer and admin agents never serve the other audience.
  if (agent.role !== role) {
    return {
      reply: EXPERIENCE[role].otherRoleMessage,
      agent: { id: ORCHESTRATOR.id, label: ORCHESTRATOR.label },
      routing,
    };
  }

  const reply = await runAgent(agent, role, history, { customerId, cart });
  return { reply, agent: { id: agent.id, label: agent.label }, routing };
}
