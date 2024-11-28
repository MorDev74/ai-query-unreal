const queryExamplesConsoleVariables = [
  "How to enable substrate material",
  "How to enable nanite meshes shadows"
];

export function QueryExamples({tag,pending,onClickFunc}:{tag:string,pending:boolean,onClickFunc:(message:string)=>void}) {
    let queryExamples:string[] = [];
    if (tag === "ConsoleVariables") {
        queryExamples = queryExamplesConsoleVariables;
    }

    return (
        <div className="grid grid-cols-2 gap-1">
          {queryExamples.map((message, index) => (
            <button
              key={index}
              className="rounded p-1 border border-gray-500 bg-emerald-500 text-gray-900
                transition-all duration-300 hover:bg-teal-400
                disabled:bg-gray-500 disabled:text-gray-900 disabled:cursor-not-allowed
              "
              disabled={pending}
              onClick={() => onClickFunc(message)}
            >
              {message}
            </button>
          ))}
        </div>
    );
}