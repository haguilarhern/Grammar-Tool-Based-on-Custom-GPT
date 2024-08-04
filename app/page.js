"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { KeyContext } from "../components/MainComponent";

function Home() {
    const getKey = useContext(KeyContext);
    const [loading, setLoading] = useState(true);
    const [assistants, setAssistants] = useState([]);

    const fetchData = async () => {
        try {
            const response = await fetch("/api");
            const data = await response.json();
            if (data.openAIKey && data.openAIKey !== "") {
                getKey.setKey(data.openAIKey);
            }
            if (data.assistants && Object.keys(data.assistants).length > 0) {
                let getAssistants = [];
                Object.keys(data.assistants).forEach((key) =>
                    getAssistants.push(data.assistants[key]),
                );
                setAssistants(getAssistants);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <main className="flex min-h-screen flex-col bg-myBg">
            <div
                id="header"
                className="flex items-center justify-between flex-wrap gap-2 bg-slate-900 text-white px-2 md:px-8 py-4"
            >
                <div className="flex items-center gap-2">
                    <Image
                        src="/assistant.svg"
                        height={50}
                        width={50}
                        alt="logo"
                    />
                    <h6 className="text-3xl font-semibold">Open Custom GPT</h6>
                </div>
            </div>
            <div className="max-w-3xl px-2 md:px-8 py-6 flex flex-col gap-5 text-gray-800">
                {loading ? (
                    <div className="flex flex-col pt-4 md:pt-0 gap-2 mt-12 text-sm text-black">
                        <div className="text-2xl font-semibold mb-4">
                            Loading...
                        </div>
                    </div>
                ) : getKey.key ? (
                    <div className="flex flex-wrap gap-4">
                        {assistants.map((assistant) => (
                            <Link
                                key={assistant.id}
                                href={"/create/" + assistant.id}
                            >
                                <div className="border-2 px-4 py-2 flex gap-4 items-center rounded-xl h-16 min-w-[20rem] max-w-xl cursor-pointer">
                                    <div className="rounded-full bg-slate-500 h-2 w-2" />
                                    <div className="flex flex-col">
                                        <div className="text-base font-medium">
                                            {assistant.name}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        <Link href="/create/new">
                            <div className="border-2 px-4 py-2 flex gap-4 items-center rounded-xl h-16 min-w-[20rem] max-w-xl cursor-pointer">
                                <div className="text-lg">+</div>
                                <div className="flex flex-col">
                                    <div className="text-base font-medium">
                                        Create a new assistant
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col pt-4 md:pt-0 gap-2 mt-12 text-sm text-black">
                        <div className="text-2xl font-semibold mb-4">
                            No OpenAI API key found. Please contact the
                            administrator.
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

export default Home;
