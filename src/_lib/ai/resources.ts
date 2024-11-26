"use server"
import fs from "fs";
import path from "path";
import { prisma } from "@/_lib/db/client";
import { generateEmbeddings } from "@/_lib/ai/embedding";

type resourceTag = "PythonScript" | "ConsoleVariables" | "StatCommands" | "ProjectSettings" | "Message";

async function createData(tag:resourceTag, content:string) {
    // clean
    prisma.unrealRagResources.deleteMany({
        where: { tag:tag, },
    });
    prisma.unrealRagEmbeddings.deleteMany({
        where: { tag:tag, },
    });

    // Table: Resource
    const resource = await prisma.unrealRagResources.create({data:{
        tag:tag,
        content:content,
    }});

    // Embedding
    const embeddings = await generateEmbeddings(content);

    // Table: Embedding
    for (const embedding of embeddings) {
        await prisma.$executeRaw`
            INSERT INTO "UnrealRagEmbeddings" ("resourceId", "tag", "content", "embedding")
            VALUES (
                ${resource.id}, 
                ${tag}, 
                ${embedding.content}, 
                ${embedding.embedding}::vector
            )
        `;
    }
}

async function createResourcePythonScripts() {
    const filePath = path.join(process.cwd(), "resources", "unreal_python_json.json");
    return;

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
                console.log(functionText);
                await createData("PythonScript", functionText);
            }
        }
    } catch (error) {
        console.error(error);
    }
}
async function createResourceConsoleVariables() {
    const filePath = path.join(process.cwd(), "resources", "unreal_console_variables_json.json");

    try {
        const data = await fs.promises.readFile(filePath, "utf8");
        const jsonData = JSON.parse(data);

        for (const jsonObject of jsonData) {

            const jsonText = JSON.stringify(jsonObject)
                .replace(/\\n/g, "")
                .replace(/\\t/g, "")
                .replace(/\\r/g, "");

            console.log(jsonText);
            await createData("ConsoleVariables", jsonText);
        }
    } catch (error) {
        console.error(error);
    }
}
async function createResourceStatCommands() {
    const filePath = path.join(process.cwd(), "resources", "unreal_stat_command_json.json");
    console.log(filePath);
}
async function createResourceProjectSettings() {
    const filePath = path.join(process.cwd(), "resources", "unreal_project_settings_json.json");
    console.log(filePath);
}

export async function createResource({content}:{content: string}) {
    await createData("Message", content);
}

export async function seedResource() {
    await createResourcePythonScripts();
    await createResourceConsoleVariables();
    await createResourceStatCommands();
    console.log("seedResource: succeed");
}