import { randomUUID } from "crypto";
import { GraphView, Topic } from "../domain/types";
import { TopicRepository } from "../ports/TopicRepository";
import { SubtopicGenerator } from "../adapters/openai/subtopicGenerator";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export class TopicService {
  // ponytail: in-process dedupe only; multiple backend instances could double-generate
  private inflight = new Map<string, Promise<Topic[]>>();

  constructor(private repo: TopicRepository, private generate?: SubtopicGenerator) {}

  /** Children from the graph; if none exist, generate with AI and persist them. */
  private async childrenOrGenerate(parent: Topic): Promise<Topic[]> {
    const existing = await this.repo.getChildren(parent.id);
    if (existing.length || !this.generate) return existing;

    let p = this.inflight.get(parent.id);
    if (!p) {
      p = (async () => {
        const subs = await this.generate!(parent);
        const created: Topic[] = [];
        for (const s of subs) {
          const id = `${slugify(s.title) || "topic"}-${randomUUID().slice(0, 8)}`;
          created.push(await this.repo.create({ id, title: s.title, description: s.description, metadata: { generated: true } }, parent.id));
        }
        return created.sort((a, b) => a.title.localeCompare(b.title));
      })().finally(() => this.inflight.delete(parent.id));
      this.inflight.set(parent.id, p);
    }
    return p;
  }

  async getTopic(id: string): Promise<Topic | null> {
    return this.repo.getById(id);
  }

  async getChildren(id: string): Promise<Topic[]> {
    const node = await this.repo.getById(id);
    return node ? this.childrenOrGenerate(node) : [];
  }

  async getRoots(): Promise<Topic[]> {
    return this.repo.getRoots();
  }

  async getGraphView(id: string): Promise<GraphView | null> {
    const node = await this.repo.getById(id);
    if (!node) return null;
    const children = await this.childrenOrGenerate(node);
    return { node, children };
  }

  async search(query: string): Promise<Topic[]> {
    return this.repo.search(query);
  }

  async create(topic: Topic, parentId?: string): Promise<Topic> {
    return this.repo.create(topic, parentId);
  }

  async update(topic: Topic): Promise<Topic> {
    return this.repo.update(topic);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }

  async addChild(parentId: string, childId: string): Promise<void> {
    return this.repo.addChild(parentId, childId);
  }
}
