"use server"

import { seedResource } from "@/_lib/ai/resources";

export async function GET(req: Request) {
    void req;
    await seedResource();
    return new Response("OK");
}