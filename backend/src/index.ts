import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InMemoryTopicRepository } from "./adapters/inmemoryAdapter";
import { Neo4jTopicRepository } from "./adapters/neo4j/neo4jAdapter";
import { TopicRepository } from "./ports/TopicRepository";
import { TopicService } from "./application/topicService";
import { createTopicRouter } from "./controllers/topicController";
import { openAiSubtopicGenerator } from "./adapters/openai/subtopicGenerator";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const dbAdapter = process.env.DB_ADAPTER || "neo4j";
const repo: TopicRepository =
  dbAdapter === "inmemory" ? new InMemoryTopicRepository() : new Neo4jTopicRepository();

const topicService = new TopicService(
  repo,
  process.env.OPENAI_API_KEY ? openAiSubtopicGenerator : undefined
);
if (!process.env.OPENAI_API_KEY) console.warn("OPENAI_API_KEY not set: AI subtopic generation disabled");

app.use("/api/topics", createTopicRouter(topicService));

app.get("/", (_, res) => {
  res.json({
    message: "Server is running!",
    dbAdapter,
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (DB_ADAPTER=${dbAdapter})`);
});
