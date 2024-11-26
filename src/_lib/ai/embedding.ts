import { embed, embedMany } from "ai";
// import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { ollama } from "ollama-ai-provider";
import { prisma } from "@/_lib/db/client";

const ollamaEmbeddingModel = ollama.embedding("nomic-embed-text", { maxEmbeddingsPerCall: 512 });
const googleEmbeddingModel = google.textEmbeddingModel("text-embedding-004",{ outputDimensionality: 512 });
const embeddingModel = process.env.NODE_ENV === "development" ? ollamaEmbeddingModel : googleEmbeddingModel;

export function generateChunks(input:string): string[] {
    return input
        .trim()
        .split(".")
        .filter(i => i !== "");
}

export async function generateEmbeddings(input:string): 
        Promise<Array<{embedding: number[]; content:string}>>
{
    const chunks = generateChunks(input);
    const { embeddings } = await embedMany({
        model: embeddingModel,
        values: chunks,
    });

    return embeddings.map((e,i) => ({content: chunks[i], embedding:e}));
}

export async function generateEmbedding(value:string):Promise<number[]> {
    const input = value.replaceAll("\\n"," ");
    const { embedding } = await embed({
        model: embeddingModel,
        value: input,
    });
    return embedding;
}

export async function findRelevantContent(userQuery: string) {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const similarityThreshold = 0.5;
    const limit = 4;

    /*
    Ref:
        const similarity = sql<number>`1 - (${cosineDistance(
            embeddings.embedding,
            userQueryEmbedded,
        )})`;
        const similarGuides = await db
            .select({ name: embeddings.content, similarity })
            .from(embeddings)
            .where(gt(similarity, 0.5))
            .orderBy(t => desc(t.similarity))
            .limit(4);

    select embedding as name and similarity from unrealRagEmbeddings
    <=> is the cosine distance
    1 - (a <=> b) is convert cosine distance to similarity
    ::vector is used to convert the embedding to a vector type
    DESC is used to sort the results in descending order
    */

    const similarGuides = await prisma.$queryRaw`
        SELECT 
            content as name,
            1 - (embedding <=> ${userQueryEmbedded}::vector) as similarity
        FROM unrealRagEmbeddings
        WHERE 1 - (embedding <=> ${userQueryEmbedded}::vector) > ${similarityThreshold}
        ORDER BY similarity DESC
        LIMIT ${limit}
    `;

    return similarGuides;
}