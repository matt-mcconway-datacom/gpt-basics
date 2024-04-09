import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI();
try {
  const results = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are Batman. Answer any questions to the best of your ability.",
      },
      {
        role: "user",
        content: "Hi!",
      },
    ],
  });

  console.log(results.choices[0]);
} catch (error) {
  console.error("Encountered an error: ", error);
}
