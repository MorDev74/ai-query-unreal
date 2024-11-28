"use client"
import { useState } from "react";
import { Message } from "ai";
import { querySimilarity } from "@/_lib/actions/QuerySimilarity";


const queryExamples = [
  "How to enable substrate material",
  "Some console variable about Far Field",
];

export default function Home() {
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(pending) {
      return;
    }
    const formData = new FormData(e.currentTarget);
    const userMessage = formData.get("userMessage") as string;

    setPending(true);
    querySimilarity(userMessage);
    setPending(false);
  }

  const CreateResource = async () => {
    await fetch("/api/dev",{method:"GET"});
  }

  return (
    <div className="flex flex-col max-w-md mx-auto py-24">

      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="userMessage"
          disabled={pending}
          className="border border-black p-1 rounded w-full"
        />
      </form>

      <button 
        onClick={CreateResource}
        className="rounded m-2 p-2 bg-blue-500 text-white"
      >Create Resources</button>

      <div className="grid gap-2">
        {queryExamples.map((message, index) => (
          <div 
            key={index}
            className="rounded bg-gray-700 p-1 border"
          >{message}</div>
        ))}
      </div>


    </div>
  );
}

async function AssistantMessage({message}:{message: Message | undefined}) {
  return (
    <div>
      {message?.content}
    </div>
  );
}