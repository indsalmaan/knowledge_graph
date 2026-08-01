import express from "express";
import { TopicService } from "../application/topicService";

export const createTopicRouter = (service: TopicService) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const q = (req.query.q as string) || "";
    const results = await service.search(q);
    res.json(results);
  });

  router.get("/roots", async (_req, res) => {
    const roots = await service.getRoots();
    res.json(roots);
  });

  router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const t = await service.getTopic(id);
    if (!t) return res.status(404).json({ error: "not found" });
    res.json(t);
  });

  router.get("/:id/graph", async (req, res) => {
    const id = req.params.id;
    const view = await service.getGraphView(id);
    if (!view) return res.status(404).json({ error: "not found" });
    res.json(view);
  });

  router.post("/", async (req, res) => {
    const { parentId, ...topic } = req.body;
    const created = await service.create(topic, parentId);
    res.status(201).json(created);
  });

  router.put("/:id", async (req, res) => {
    const id = req.params.id;
    const topic = { ...req.body, id };
    const updated = await service.update(topic);
    res.json(updated);
  });

  router.delete("/:id", async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).send();
  });

  router.post("/:id/children", async (req, res) => {
    const parentId = req.params.id;
    const childId = req.body.childId;
    await service.addChild(parentId, childId);
    res.status(204).send();
  });

  return router;
};
