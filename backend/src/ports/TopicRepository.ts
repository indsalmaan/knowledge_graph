import { Topic } from "../domain/types";

export interface TopicRepository {
  getById(id: string): Promise<Topic | null>;
  getChildren(id: string): Promise<Topic[]>;
  getRoots(): Promise<Topic[]>;
  search(query: string): Promise<Topic[]>;
  create(topic: Topic, parentId?: string): Promise<Topic>;
  update(topic: Topic): Promise<Topic>;
  delete(id: string): Promise<void>;
  addChild(parentId: string, childId: string): Promise<void>;
}
