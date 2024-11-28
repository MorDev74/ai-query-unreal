"use server"

import { findRelevantContent } from "@/_lib/ai/embedding";

export async function querySimilarity(question:string) {
    const embeddingRows = await findRelevantContent(question);

    const { name,similarity } = embeddingRows;
    console.log(`name: ${name}, similarity: ${similarity}`);
}