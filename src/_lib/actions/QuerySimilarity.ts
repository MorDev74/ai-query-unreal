"use server"

import { findRelevantContent } from "@/_lib/ai/embedding";

export async function querySimilarity(question:string,tag:string) {
    let result:{tag:string, content:{name:string, similarity:number}[]} = {
        tag: tag,
        content: []
    };

    const embeddingRows = await findRelevantContent(question,tag);

    embeddingRows.forEach(({ name, similarity }) => {
        result.content.push({ name, similarity });
    });

    return result;
}