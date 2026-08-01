import { Topic } from "../../domain/types";
import { TopicRepository } from "../../ports/TopicRepository";

export class SQLTopicRepository implements TopicRepository {
  // TODO: implement using chosen SQL library (Prisma/TypeORM/knex).
  // Deferred post-MVP: reserved for relational concerns (users/auth/comments), not topic graph data.
  async getById(id: string): Promise<Topic | null> {
    throw new Error("Not implemented");
  }
  async getChildren(id: string): Promise<Topic[]> {
    throw new Error("Not implemented");
  }
  async getRoots(): Promise<Topic[]> {
    throw new Error("Not implemented");
  }
  async search(query: string): Promise<Topic[]> {
    throw new Error("Not implemented");
  }
  async create(topic: Topic, parentId?: string): Promise<Topic> {
    throw new Error("Not implemented");
  }
  async update(topic: Topic): Promise<Topic> {
    throw new Error("Not implemented");
  }
  async delete(id: string): Promise<void> {
    throw new Error("Not implemented");
  }
  async addChild(parentId: string, childId: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
