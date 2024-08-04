"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import OpenAI from "openai";
import { useSearchParams } from "next/navigation";

function Embed({ params: { assistantId } }) {
    const [question, setQuestion] = useState("");
    const [chat, setChat] = useState([]);
    const [thread, setThread] = useState(null);
    const [run, setRun] = useState(null);
    const [openai, setOpenai] = useState(null);
    const [loading, setLoading] = useState(false);
    const [runInterval, setRunInterval] = useState(null);
    const searchParams = useSearchParams();
    const intervalRef = useRef(null);
    intervalRef.current = runInterval;
    const chatRef = useRef(null);
    chatRef.current = chat;

    const refreshChat = () => {
        setChat([]);
        setThread(null);
    };

    const getAnswer = async (threadId, runId) => {
        const getRun = await openai.beta.threads.runs.retrieve(threadId, runId);

        if (getRun.status == "completed") {
            const messages = await openai.beta.threads.messages.list(threadId);
            setLoading(false);
            setChat((prevChat) => [
                ...prevChat,
                {
                    isBot: true,
                    msg: messages.data[0].content[0].text.value.replace(
                        /\n/g,
                        "<br>",
                    ),
                },
            ]);
        } else {
            setTimeout(() => getAnswer(threadId, runId), 200);
        }
    };

    const askAssistant = async () => {
        let getQuestion = question.replace(/\n/g, "<br>");
        setQuestion("");
        setChat((prevChat) => [
            ...prevChat,
            { isBot: false, msg: getQuestion },
        ]);
        setLoading(true);
        let getThread;
        if (!thread) {
            getThread = await openai.beta.threads.create();
            setThread(getThread);
        } else {
            getThread = thread;
        }
        await openai.beta.threads.messages.create(getThread.id, {
            role: "user",
            content: question,
        });
        const getRun = await openai.beta.threads.runs.create(getThread.id, {
            assistant_id: assistantId,
        });
        setRun(getRun);
        getAnswer(getThread.id, getRun.id);
    };

    useEffect(() => {
        const fetchOpenAIKey = async () => {
            try {
                const response = await fetch("/api");
                const data = await response.json();
                if (data.openAIKey) {
                    setOpenai(
                        new OpenAI({
                            apiKey: data.openAIKey,
                            dangerouslyAllowBrowser: true,
                        }),
                    );
                }
            } catch (error) {
                console.error("Error fetching OpenAI key:", error);
            }
        };
        fetchOpenAIKey();
    }, []);

    const createMarkup = (html) => {
        return { __html: html };
    };

    const copyToClipboard = (html) => {
        const tempContainer = document.createElement("div");
        tempContainer.innerHTML = html;

        let textBeforeBulletPoints = "";
        let foundBulletPoints = false;

        for (let child of tempContainer.childNodes) {
            if (
                child.nodeType === Node.ELEMENT_NODE &&
                (child.tagName === "UL" || child.tagName === "LI")
            ) {
                foundBulletPoints = true;
                break;
            }
            textBeforeBulletPoints += child.textContent + "\n";
        }

        if (!foundBulletPoints) {
            textBeforeBulletPoints = tempContainer.textContent;
        }

        const textToCopy = textBeforeBulletPoints.trim();

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => alert("Copied to clipboard!"))
            .catch((err) => console.error("Error copying text: ", err));
    };

    return (
        <div className="h-screen w-screen md:p-4 flex flex-col bg-myBg gap-4">
            {openai ? (
                <>
                    <div className="flex gap-2 p-4 bg-white rounded-xl shadow-md">
                        <textarea
                            id="question"
                            className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-40 resize-none p-4 shadow-lg"
                            placeholder="Insert your text here"
                            required
                            value={question}
                            onKeyDown={(e) => {
                                if (e.code === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    askAssistant();
                                }
                            }}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <button
                            onClick={askAssistant}
                            className="bg-mySecondary hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-4 py-2.5 text-center shadow-lg"
                        >
                            <Image
                                height={20}
                                width={20}
                                src="/send.svg"
                                alt="send"
                            />
                        </button>
                        <button
                            onClick={refreshChat}
                            className="bg-white text-black hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 font-bold rounded-lg text-sm w-1/3 sm:w-auto px-4 py-2.5 text-center shadow-lg"
                        >
                            CLEAR
                        </button>
                    </div>
                    <div className="flex flex-col gap-2 w-full h-full overflow-y-auto scroll mt-4">
                        {chat.map((msg, index) => (
                            <div
                                key={index}
                                className={`${msg.isBot ? "bg-gray-900 text-gray-100 self-start" : "text-gray-900 bg-gray-100 self-end border-2"} rounded-lg px-3 py-2 max-w-sm shadow-md cursor-pointer`}
                                dangerouslySetInnerHTML={createMarkup(msg.msg)}
                                onClick={() => copyToClipboard(msg.msg)}
                            />
                        ))}
                        {loading && (
                            <div className="bg-gray-900 text-gray-100 self-start rounded-lg px-3 py-2 max-w-sm shadow-md">
                                <div className="flex h-4 items-center gap-2">
                                    <div className="bounce bounce1 rounded-full bg-slate-500 h-2 w-2" />
                                    <div className="bounce bounce2 rounded-full bg-slate-500 h-2 w-2" />
                                    <div className="bounce bounce3 rounded-full bg-slate-500 h-2 w-2" />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex max-w-xl flex-col pt-4 md:pt-0 gap-2 text-sm text-black">
                    <div className="text-xl font-semibold mb-4">
                        Loading assistant...
                    </div>
                </div>
            )}
        </div>
    );
}

export default Embed;
