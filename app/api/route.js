import fsPromises from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const dataFilePath = path.join(process.cwd(), "db.json");

export async function GET(request) {
    var url = new URL(request.url);
    const assistantId = url.searchParams.get("assistantId");
    const jsonData = await fsPromises.readFile(dataFilePath);
    const objectData = JSON.parse(jsonData);
    let resData = {
        openAIKey: objectData.openAIKey,
        assistant: assistantId
            ? assistantId === "new"
                ? null
                : objectData.assistants[assistantId]
            : null,
        assistants: !assistantId ? objectData.assistants : null,
    };
    return NextResponse.json(resData);
}

export async function POST(request) {
    const req = await request.json();
    const jsonData = await fsPromises.readFile(dataFilePath);
    const objectData = JSON.parse(jsonData);
    objectData.assistants[req.id] = req;
    await fsPromises.writeFile(dataFilePath, JSON.stringify(objectData));
    return NextResponse.json({ msg: "assistant added" });
}
