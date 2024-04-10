import { openai } from "./openai";
import chalk from "chalk";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { CharacterTextSplitter } from "langchain/text_splitter";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { YoutubeLoader } from "langchain/document_loaders/web/youtube";

const question = process.argv[2];
const video = "https://youtu.be/zR_iuq2evXo?si=cG8rODgRgXOx9_Cn";

const createStore = async (docs) =>
  MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

const docsFromYTVideo = (video) => {
  const loader = YoutubeLoader.createFromUrl(video, {
    language: "en",
    addVideoInfo: true, // Adds video metadata to the document. Can be used to show source of qa result
  });

  // We split the video because a full transcript would be too many tokens
  // So we can filter before querying, so we send the chunk that contains the relevant info
  // Overlapping chunks are used to ensure we don't miss any information if we chunk in the middle of context
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: " ",
      chunkSize: 2500,
      chunkOverlap: 100,
    })
  );
};

// So the process is chunks go to vector db as embeddings
// Then query the vectordb with semantic search, and find chunks that are related
// Then perfom query on relevant chunks for the final answer

const docsFromPDF = () => {
  const loader = new PDFLoader("xbox.pdf");
  return loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ". ", // End of sentence
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  );
};

const loadStore = async () => {
  // const videoDocs = await docsFromYTVideo(video); // API is broken :(
  const pdfDocs = await docsFromPDF();

  return createStore([...pdfDocs]);
};

const query = async () => {
  if (question === undefined) {
    throw new Error("No question provided.");
  }
  const store = await loadStore();
  const results = await store.similaritySearch(question, 2);
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0, // We want accurate responses. Particularly for document QA
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant. Answer questions to the best of your ability.",
      },
      {
        role: "user",
        content: `Answer the following question using the procided context. If you can't answere the question with the context, don't lie. Instead tell me you need more context.
            Question: ${question}

            Context: ${results.map((result) => result[0]).join("\n")}`,
      },
    ],
  });

  console.log(
    `${chalk.yellow("Answer")}: ${
      response.choices[0].message.content
    }\n${chalk.yellow("Sources")}: ${results
      .map((result) => result.metadata.source)
      .join(", ")}`
  );
};

query();
