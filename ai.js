export async function summarizePost(content) {
    const apiKey = "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"; // Replace with your actual key
    // const siteUrl = "https://your-site-url.com";
    // const siteName = "Qwen3 Summary Tool";

    const fewShotPrompt = `
    You are a helpful assistant that summarizes social media or blog posts in 1-2 sentences.

    Example 1:
    Post: আমি আজকে প্রথমবারের মতো জাভাস্ক্রিপ্ট দিয়ে একটি প্রজেক্ট শেষ করলাম। অনেক কিছু শিখেছি!
    Summary: ব্যবহারকারী জাভাস্ক্রিপ্ট দিয়ে প্রথম প্রজেক্ট শেষ করেছে এবং অনেক কিছু শিখেছে।

    Example 2:
    Post: I just finished reading “Deep Learning with Python” — amazing book, especially the chapters on RNNs!
    Summary: The user finished reading "Deep Learning with Python" and found the RNN chapters especially impressive.

    Example 3:
    Post: আজকের দিনটা খুব খারাপ কেটেছে। রাস্তায় জ্যাম, অফিসে ঝামেলা, সব মিলিয়ে বিরক্ত লাগছে।
    Summary: ব্যবহারকারীর দিনটি খারাপ কেটেছে ট্রাফিক এবং অফিসের সমস্যার কারণে।

    Now summarize the following post:

    Post: ${content}
    Summary:
    `;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
                // "HTTP-Referer": siteUrl,
                // "X-Title": siteName
            },
            body: JSON.stringify({
                model: "qwen/qwen3-235b-a22b",
                messages: [
                    {
                        role: "user",
                        content: fewShotPrompt
                    }
                ]
            })
        });

        const data = await response.json();
        const summary = data.choices?.[0]?.message?.content;
        console.log("✅ Summary:", summary);
        return summary;

    } catch (error) {
        console.error("🔴 Error:", error);
        return null;
    }
}
