import { embed, embedMany } from "ai";
import { sql } from '@vercel/postgres';
// import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { ollama } from "ollama-ai-provider";
import { EmbeddingModelV1Embedding } from '@ai-sdk/provider';

const ollamaEmbeddingModel = ollama.embedding("nomic-embed-text", { maxEmbeddingsPerCall: 512 });
const googleEmbeddingModel = google.textEmbeddingModel("text-embedding-004",{ outputDimensionality: 512 });
const embeddingModel = process.env.NODE_ENV === "development" ? ollamaEmbeddingModel : googleEmbeddingModel;

function generateChunksLength(input:string, maxLength:number): string[] {
    const chunks: string[] = [];
    let currentChunk = "";
    input.split(' ').forEach(word => {
        if ((currentChunk + word).length > maxLength) {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
            }
            if (word.length <= maxLength) {
                currentChunk = word;
            } else {
                while (word.length > maxLength) {
                    chunks.push(word.slice(0, maxLength));
                    word = word.slice(maxLength);
                }
                currentChunk = word;
            }
        } else {
            currentChunk += ' ' + word;
        }
    });

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

export function generateChunks(input:string): string[] {
    return input
        .trim()
        .split(".")
        .filter(i => i !== "");
}

function extendVector({vector, targetLength}:{vector:number[], targetLength:number}) {
  if (vector.length >= targetLength) {
    return vector.slice(0, targetLength);
  }

  const extendedVector = [...vector];
  while (extendedVector.length < targetLength) {
    extendedVector.push(0);
  }
  return extendedVector;
}

export async function generateEmbeddings(input:string): 
        Promise<Array<{embedding: number[]; content:string}>>
{
    // const chunks = generateChunks(input);
    const chunks = generateChunksLength(input,512);

    const { embeddings }:{embeddings:EmbeddingModelV1Embedding[]} = await embedMany({
        model: embeddingModel,
        values: chunks,
    });

    return embeddings.map((e,i) => ({
        content: chunks[i], 
        embedding:extendVector({
            vector:e,
            targetLength:1536
        })
    }));
}

export async function generateEmbedding(value:string):Promise<number[]> {
    const input = value.replaceAll("\\n"," ");
    const { embedding }:{embedding:EmbeddingModelV1Embedding} = await embed({
        model: embeddingModel,
        value: input,
    });
    return embedding;
}

export async function findRelevantContent(userQuery: string) {
    const userQueryEmbedded = await generateEmbedding(userQuery);
    const extendedEmbedded = extendVector({ vector:userQueryEmbedded, targetLength:1536 })
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

    const extendedEmbeddedText:string = JSON.stringify(extendedEmbedded);

    const result = await sql`
        SELECT
            "content" AS "name",
            1 - ( "embedding" <=> ${extendedEmbeddedText} ) AS "similarity"
        FROM proj_ai_query_unreal.unreal_rag_embeddings
        WHERE 1 - ( "embedding" <=> ${extendedEmbeddedText} ) > ${similarityThreshold}
        ORDER BY "similarity" DESC
        LIMIT ${limit};
    `;

    const similarGuides = result.rows[0];

    return similarGuides;
}