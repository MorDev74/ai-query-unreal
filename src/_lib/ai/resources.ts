"use server"

import cuid from "cuid";
import fs from "fs";
import path from "path";
import { sql } from '@vercel/postgres';
import { generateEmbeddings } from "@/_lib/ai/embedding";

type resourceTag = "PythonScript" | "ConsoleVariables" | "StatCommands" | "ProjectSettings" | "Message";

async function createData(tag:resourceTag, content:string) {
    try {
        // Table: Resource
        const id = cuid();
        const result = await sql`
            INSERT INTO proj_ai_query_unreal.unreal_rag_resources ("id", "tag", "content")
            VALUES (${id}, ${tag}, ${content})
            RETURNING "id", "tag", "content";
        `;
        const resource = result.rows[0];

        // Embedding
        const embeddings = await generateEmbeddings(content);

        // Table: Embedding
        for (const embedding of embeddings) {
            const embeddingId = cuid();
            const embeddingArray:number[] = embedding.embedding.map(Number);
            const embeddingArrText:string = JSON.stringify(embeddingArray);

            await sql`
                INSERT INTO proj_ai_query_unreal.unreal_rag_embeddings ("id", "resource_id", "tag", "content", "embedding")
                VALUES (${embeddingId}, ${resource.id}, ${tag}, ${embedding.content}, ${embeddingArrText} );
            `;
        }
    } catch (error) {
        // void error;
        console.log("create data: " + error);
    }
}

async function createResourcePythonScripts() {
    const filePath = path.join(process.cwd(), "resources", "unreal_python_json.json");

    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);

        for (const jsonObject of jsonData) {
            const objectType = jsonObject.type;
            const objectName = jsonObject.name;

            let functionText = "";
            if (objectType === "class") {
                for (let functionObject of jsonObject.functions) {
                    functionObject.owner = objectName;
                    functionText = JSON.stringify(functionObject);
                }
            } else if (objectType === "function") {
                functionText = JSON.stringify(jsonObject);
            }

            if (functionText) {
                functionText = functionText
                    .replace(/\\n/g, "")
                    .replace(/\\t/g, "")
                    .replace(/\\r/g, "");
                await createData("PythonScript", functionText);
            }
        }
    } catch (error) {
        console.error(error);
    }
}
async function createResourceConsoleVariables() {
    const filePath = path.join(process.cwd(), "resources", "unreal_console_variables_json.json");
    const tag = "ConsoleVariables";

    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);

        const length = jsonData.length;
        let count = 0;

        for (const jsonObject of jsonData) {
            const jsonText = JSON.stringify(jsonObject)
                .replace(/\\n/g, "")
                .replace(/\\t/g, "")
                .replace(/\\r/g, "");

            await createData(tag, jsonText);
            count = count + 1;
            console.log(tag + ": " + count + "/" + length + " complete");

            // temp 
            break;
        }
    } catch (error) {
        console.error(error);
    }
}
async function createResourceStatCommands() {
    const filePath = path.join(process.cwd(), "resources", "unreal_stat_command_json.json");
    const tag = "StatCommands";
    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);

        const length = jsonData.length;
        let count = 0;

        for (const jsonObject of jsonData) {
            const jsonText = JSON.stringify(jsonObject)
                .replace(/\\n/g, "")
                .replace(/\\t/g, "")
                .replace(/\\r/g, "");

            await createData(tag, jsonText);
            count = count + 1;
            console.log(tag + ": " + count + "/" + length + " complete");
        }
    } catch (error) {
        console.error(error);
    }
}

async function createResourceProjectSettings() {
    const filePath = path.join(process.cwd(), "resources", "unreal_project_settings_json.json");
    const tag = "ProjectSettings";
    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);

        const length = jsonData.length;
        let count = 0;

        for (const jsonObject of jsonData) {
            const jsonText = JSON.stringify(jsonObject)
                .replace(/\\n/g, "")
                .replace(/\\t/g, "")
                .replace(/\\r/g, "");

            await createData(tag, jsonText);
            count = count + 1;
            console.log(tag + ": " + count + "/" + length + " complete");
        }
    } catch (error) {
        console.error(error);
    }
}

export async function createResource({content}:{content: string}) {
    await createData("Message", content);
}

export async function seedResource() {

    const tags = ["PythonScript", "ConsoleVariables", "StatCommands", "ProjectSettings", "Message"];
    // clean
    for (const tag of tags) {
        await sql`
            DELETE FROM proj_ai_query_unreal.unreal_rag_embeddings
            WHERE 'tag' = ${tag};
        `;
        await sql`
            DELETE FROM proj_ai_query_unreal.unreal_rag_resources
            WHERE 'tag' = ${tag};
        `;
    }

    // await createResourcePythonScripts();
    await createResourceConsoleVariables();
    // await createResourceStatCommands();
    // await createResourceProjectSettings();
    console.log("===== seedResource: succeed");
}