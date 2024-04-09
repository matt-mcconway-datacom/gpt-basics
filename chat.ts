import { createInterface } from "node:readline/promises";
import { openai } from "./openai";
import {
  ChatCompletionMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

const chat = () => {
  const history: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are Batman. Answer any questions to the best of your ability, as Batman.",
    },
  ];

  const start = () => {
    rl.question("You: ", async (userInput) => {
      if (userInput.toLowerCase() === "exit") {
        rl.close();
        return;
      }
      const message = formatMessage(userInput);
      const response = await newMessage(history, message);
      history.push(message, response);

      console.log(`\n\nBatman: ${response.content}\n\n`);

      start();
    });
  };

  console.log("\n\nBatman: How can I help you today?\n\n");
  start();
};

console.log("I'm Batman. Ask me anything. Type 'exit' to quit.");
chat();
