"use client";
import { createContext, useState, useEffect } from "react";

const keyDefault = {
    key: "",
    setKey: () => {},
    loading: true,
};

export const KeyContext = createContext(keyDefault);

function MainComponent({ children }) {
    const [key, setKey] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const response = await fetch("/api");
                const data = await response.json();
                if (data.openAIKey) {
                    setKey(data.openAIKey);
                }
            } catch (error) {
                console.error("Error fetching API key:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApiKey();
    }, []);

    return (
        <KeyContext.Provider value={{ key, setKey, loading }}>
            {children}
        </KeyContext.Provider>
    );
}

export default MainComponent;
