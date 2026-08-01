import { GraphView, Topic } from "../domain/types";
import { TopicRepository } from "../ports/TopicRepository";

export class TopicService {
  constructor(private repo: TopicRepository) {}

  async getTopic(id: string): Promise<Topic | null> {
    return this.repo.getById(id);
  }

  async getChildren(id: string): Promise<Topic[]> {
    return this.repo.getChildren(id);
  }

  async getRoots(): Promise<Topic[]> {
    return this.repo.getRoots();
  }

  async getGraphView(id: string): Promise<GraphView | null> {
    const node = await this.repo.getById(id);
    if (!node) return null;
    const children = await this.repo.getChildren(id);
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
