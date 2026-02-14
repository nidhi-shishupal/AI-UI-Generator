export async function callOllama(prompt) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
        const response = await fetch(process.env.OLLAMA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral",
                prompt,
                stream: false
            }),
            signal: controller.signal
        });

        const data = await response.json();
        clearTimeout(timeout);

        return data.response;
    } catch (error) {
        clearTimeout(timeout);
        throw new Error("AI service unavailable");
    }
}
