import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Sends a message to ChatGPT and receives a response in JSON format.
 * @param {Array} messages - An array of message objects for the conversation.
 * @returns {Promise<Object>} - The response from ChatGPT in JSON format.
 */
export async function sendMessageToChatGPT(messages) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
        });
        return completion; // Returns the full JSON response
    } catch (error) {
        console.error("Error communicating with ChatGPT:", error);
        throw error;
    }
}

sendMessageToChatGPT(messages)
    .then((response) => console.log(response))
    .catch((error) => console.error(error));