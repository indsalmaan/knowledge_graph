import { Topic } from "../domain/types";
import { TopicRepository } from "../ports/TopicRepository";

export class InMemoryTopicRepository implements TopicRepository {
  private store = new Map<string, Topic>();
  private childrenOf = new Map<string, Set<string>>();
  private parentOf = new Map<string, string>();

  async getById(id: string): Promise<Topic | null> {
    return this.store.get(id) ?? null;
  }

  async getChildren(id: string): Promise<Topic[]> {
    const childIds = this.childrenOf.get(id);
    if (!childIds) return [];
    return Array.from(childIds)
      .map((childId) => this.store.get(childId))
      .filter((t): t is Topic => !!t)
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  async getRoots(): Promise<Topic[]> {
    return Array.from(this.store.values()).filter((t) => !this.parentOf.has(t.id));
  }

  async search(query: string): Promise<Topic[]> {
    const q = (query || "").toLowerCase();
    return Array.from(this.store.values()).filter(
      (t) => t.title.toLowerCase().includes(q) || (t.description || "").toLowerCase().includes(q)
    );
  }

  async create(topic: Topic, parentId?: string): Promise<Topic> {
    this.store.set(topic.id, topic);
    if (parentId) await this.addChild(parentId, topic.id);
    return topic;
  }

  async update(topic: Topic): Promise<Topic> {
    this.store.set(topic.id, topic);
    return topic;
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
    this.childrenOf.delete(id);
    const parentId = this.parentOf.get(id);
    if (parentId) this.childrenOf.get(parentId)?.delete(id);
    this.parentOf.delete(id);
  }

  async addChild(parentId: string, childId: string): Promise<void> {
    if (!this.store.has(parentId) || !this.store.has(childId)) {
      throw new Error("Parent or child not found");
    }
    if (!this.childrenOf.has(parentId)) this.childrenOf.set(parentId, new Set());
    this.childrenOf.get(parentId)!.add(childId);
    this.parentOf.set(childId, parentId);
  }
}
