import OpenAI from "openai";

console.log({first: process.env.NEXT_PUBLIC_OPENAI_API_KEY})

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const getChatCompletion = async (prompt: string): Promise<any> => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message || "No response";
  } catch (error) {
    console.error("Error fetching chat completion:", error);
    return "Error: Unable to fetch response.";
  }
};
