"use client"

import { useState } from "react";
import { querySimilarity } from "@/_lib/actions/QuerySimilarity";
import { RadioGroup } from "@/components/RadioGroup";
import { AssistantMessage } from "@/components/AssistantMessage";
import { QueryExamples } from "@/components/Examples";
import { handleClientScriptLoad } from "next/script";

const optionList = [
  { value: "ConsoleVariables", enabled: true, },
  { value: "PythonScript", enabled: false, },
  { value: "StatCommands", enabled: false, },
  { value: "ProjectSettings", enabled: false, },
];

export default function Home() {
  const [pending, setPending] = useState(false);
  const [selectedOption, setSelectedOption] = useState(optionList[0].value);
  const [queryResult, setQueryResult] = useState< {tag:string, content:{name:string, similarity:number}[]} >( {tag: selectedOption, content: []});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userMessage = formData.get("userMessage") as string;
    setPending(true);
    const result = await querySimilarity(userMessage,selectedOption);
    setQueryResult(result);
    setPending(false);
  }

  async function hanldeClickExample(input: string) {
    setPending(true);
    const result = await querySimilarity(input,selectedOption);
    setQueryResult(result);
    setPending(false);
  }

  const CreateResource = async () => {
    await fetch("/api/dev/create-resources", { method: "GET" });
  }

  return (
    <div className="flex flex-col max-w-md mx-auto py-24 gap-2">

      <RadioGroup optionList={optionList} setOptionFunc={setSelectedOption}/>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="userMessage"
          disabled={pending}
          className="border border-gray-500 py-1 px-2 rounded w-full"
          placeholder="Enter your message"
        />
      </form>

      {pending && <div className="m-2 p-2 rounded-md text-emerald-500 bg-gray-900">Pending...</div>}


      {process.env.NODE_ENV === "development" && (
        <button
          onClick={CreateResource}
          className="rounded p-1 border border-gray-500 bg-emerald-500 text-gray-900
            transition-all duration-300 hover:bg-teal-400
            disabled:bg-gray-500 disabled:text-gray-900 disabled:cursor-not-allowed
          "
        >Create Resources (Dev)</button>
      )}

      <div className="flex flex-col gap-1 border border-gray-500 p-3 rounded-md">
        <label className="text-white text-xl font-bold mb-2">Examples ({selectedOption})</label>
        <QueryExamples tag={selectedOption} pending={pending} onClickFunc={hanldeClickExample}/>
      </div>

      {queryResult.content.length > 0 && 
        <div className="flex flex-col border border-gray-500 rounded-md h-full">
          {queryResult.content.map((res,index) => (
            <AssistantMessage key={index} tag={queryResult.tag} content={res.name}/>
          ))}
        </div>
      }

    </div>
  );
}