# Basics FE Masters

1. [Get api key](https://platform.openai.com/api-keys), add it to a `.env`, following `.sample.env` format
2. `pnpm install`
3. `pnpm start`

I use [ASDF](https://asdf-vm.com/) to manage toolchain versions via `.tool-versions`

Running:

- Chat with Batman: `bun chat.ts`
- Semantic Search: `bun search.ts`
- Document QA: `bun qa.ts "Some query"`
- Function Calling: `bun functions.ts "What is 12 * 100 / 12 + 290 / 67 * 2?"`
