import { openai } from "./openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

const newMessage = async (
  history: ChatCompletionMessageParam[],
  message: ChatCompletionUserMessageParam
) => {
  const results = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [...history, message],
  });

  return results.choices[0].message;
};

const formatMessage = (userInput: string): ChatCompletionUserMessageParam => ({
  role: "user",
  content: userInput,
});

process.on("SIGINT", () => {
  console.log("\nExiting on SIGINT");
  process.exit();
});

const chat = () => {
  const history: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are Batman. Answer any questions to the best of your ability, as Batman.",
    },
  ];

  const start = async () => {
    process.stdout.write("You: ");

    for await (const line of console) {
      if (line.toLowerCase() === "exit") {
        process.exit();
      }
      const message = formatMessage(line);
      const response = await newMessage(history, message);
      history.push(message, response);

      console.log(`\n\nBatman: ${response.content}\n\n`);
    }
  };

  console.log("\n\nBatman: How can I help you today?\n\n");
  start();
};

console.log("I'm Batman. Ask me anything. Type 'exit' to quit.");
chat();
