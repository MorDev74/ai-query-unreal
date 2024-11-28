
type ConsoleVariablesType = {
    name: string;
    help: string;
}
function ConsoleVariablesMessage({inJsonObject}:{inJsonObject:object}) {
    const jsonObject:ConsoleVariablesType = inJsonObject as ConsoleVariablesType;
    return (
        <div className="flex flex-col">
            <div className="font-bold mb-2">Console Variable: {jsonObject.name}</div>
            <div className="text-sm">Description: {jsonObject.help}</div>
        </div>
    );
}
export function AssistantMessage({ tag, content }: { tag: string, content: string }) {
    const jsonObject = JSON.parse(content);

    let messageComponent = null;
    if (tag === "ConsoleVariables") {
        messageComponent = <ConsoleVariablesMessage inJsonObject={jsonObject}/>;
    }
    
    return (
        <div>
            <div className="m-2 p-2 rounded-md text-emerald-500 bg-gray-900">
                {messageComponent}
            </div>
        </div>
    );
}