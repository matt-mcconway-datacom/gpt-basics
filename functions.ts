import { ChatCompletionMessageParam } from "openai/resources";
import { openai } from "./openai";
import math from "advanced-calculator";

const question = process.argv[2];

const messages: ChatCompletionMessageParam[] = [
  {
    role: "system",
    content:
      "You are a helpful AI assistant, who is specialised in Math at a university level. Answer questions to the best of your ability.",
  },
  {
    role: "user",
    content: question,
  },
];

// A function router essentially
const functions = {
  calculate({ expression }) {
    return math.evaluate(expression);
  },
};

const getCompletion = (messages) => {
  return openai.chat.completions.create({
    // Note: Only some models support the function calling api
    // Parallel calling is also possible! https://platform.openai.com/docs/guides/function-calling/parallel-function-calling
    model: "gpt-3.5-turbo",
    messages,
    temperature: 0,
    // function_call also exists, it's used to force the model to call a specific function
    // Good usecase is to get a structured output from the model
    functions: [
      {
        name: "calculate",
        description: "Run a math expression", // Also used for the model to know when to call it / what the function does
        parameters: {
          type: "object",
          properties: {
            expression: {
              type: "string",
              description:
                'The math expression to evaluate, for example: "2 * 3 + (21 / 2) ^ 2"', // Fuzzy match example for GPT to understand when to call it
            },
          },
          required: ["expression"], // Required parameters to run the function
        },
      },
    ],
  });
};

let response;

while (true) {
  response = await getCompletion(messages);

  if (response.choices[0].finish_reason === "stop") {
    console.log(response.choices[0].message.content);
    break;
  } else if (response.choices[0].finish_reason === "function_call") {
    const fnName = response.choices[0].message.function_call.name;
    const args = response.choices[0].message.function_call.arguments;

    const funcToCall = functions[fnName];
    const params = JSON.parse(args);

    const result = funcToCall(params);

    messages.push({
      role: "assistant",
      content: null,
      function_call: { name: fnName, arguments: args },
    });

    messages.push({
      role: "function",
      name: fnName,
      content: JSON.stringify({ result }),
    });
  }
}
