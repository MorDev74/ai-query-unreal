// import { prisma } from "@/_lib/db/client";
// import { openai } from '@ai-sdk/openai';
// import { google } from '@ai-sdk/google';
import { createOllama } from "ollama-ai-provider";
import { streamText,tool } from 'ai';
import { z } from "zod"
// import { createResource } from "@/_lib/ai/resources";
import { findRelevantContent } from "@/_lib/ai/embedding";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const ollamaClient = createOllama();
    const model = ollamaClient("qwen2.5:1.5b");

    // const system = `You are a helpful assistant. Check your knowledge base before answering any questions.
    // Only respond to questions using information from tool calls.
    // if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`

    const system = `You are a helpful assistant. 
      Only respond to questions using information from tool calls.
      if no relevant information is found in the tool calls, respond, "Sorry, I don't know."`

    const tools = {
      // addResource: tool({
      //   description: `add a resource to your knowledge base.
      //     If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      //   parameters: z.object({
      //     content: z
      //       .string()
      //       .describe('the content or resource to add to the knowledge base'),
      //   }),
      //   execute: async ({ content }) => createResource({ content }),
      // }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
    };

    const result = streamText({
        model:model,
        system:system,
        messages,
        tools:tools,
    });

    return result.toDataStreamResponse();
}