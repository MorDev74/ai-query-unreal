"use client"

import React,{useState} from "react";
export function RadioGroup({
    optionList,
    setOptionFunc,
}: {
    optionList: { value: string, enabled: boolean }[],
    setOptionFunc: React.Dispatch<React.SetStateAction<string>>,
}) {
    const [selectedOption, setSelectedOption] = useState(optionList[0].value);

    function handleOptionChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSelectedOption(e.target.value);
        setOptionFunc(e.target.value);
    }

    return (
        <div className="flex flex-row justify-center m-2">
            <div className="relative flex flex-row gap-1">
                {optionList.map((optionInfo, index) => (
                    <div
                        key={index}
                        className={`-skew-x-12`}
                    >

                        <input
                            key={`input-${index}`}
                            type="radio"
                            id={`${optionInfo.value}-${index}`}
                            name="options"
                            value={optionInfo.value}
                            onChange={handleOptionChange}
                            disabled={!optionInfo.enabled}
                            checked={selectedOption === optionInfo.value}
                            className="appearance-none"
                        />

                        <label
                            key={`label-${index}`}
                            htmlFor={`${optionInfo.value}-${index}`}
                            title={`${optionInfo.enabled ? 'Enabled' : 'Disabled'}`}
                            className={`border border-gray-300 px-4 py-2 cursor-pointer
                                transition-all duration-500 ease-in-out
                                font-bold
                                ${selectedOption === optionInfo.value
                                                    ? "text-emerald-500 bg-black hover:text-teal-200"
                                                    : "text-gray-300 bg-gray-900 hover:text-gray-500 hover:bg-black"}
                            `}
                        >{optionInfo.value}</label>

                    </div>
                ))}
            </div>
        </div>
    );
}