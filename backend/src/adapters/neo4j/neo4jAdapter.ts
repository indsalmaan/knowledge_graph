import { Node } from "neo4j-driver";
import { Topic } from "../../domain/types";
import { TopicRepository } from "../../ports/TopicRepository";
import { getNeo4jDriver } from "./driver";

function toTopic(node: Node): Topic {
  const props = node.properties as Record<string, any>;
  return {
    id: props.id,
    title: props.title,
    description: props.description ?? undefined,
    metadata: props.metadata ? JSON.parse(props.metadata) : undefined,
    createdAt: props.createdAt ?? undefined,
    updatedAt: props.updatedAt ?? undefined,
  };
}

function toProps(topic: Topic): Record<string, any> {
  return {
    id: topic.id,
    title: topic.title,
    description: topic.description ?? null,
    metadata: topic.metadata ? JSON.stringify(topic.metadata) : null,
    createdAt: topic.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export class Neo4jTopicRepository implements TopicRepository {
  private async run(query: string, params: Record<string, any> = {}) {
    const session = getNeo4jDriver().session();
    try {
      return await session.run(query, params);
    } finally {
      await session.close();
    }
  }

  async getById(id: string): Promise<Topic | null> {
    const result = await this.run("MATCH (t:Topic {id: $id}) RETURN t", { id });
    if (result.records.length === 0) return null;
    return toTopic(result.records[0].get("t"));
  }

  async getChildren(id: string): Promise<Topic[]> {
    const result = await this.run(
      "MATCH (:Topic {id: $id})-[:HAS_SUBTOPIC]->(c:Topic) RETURN c ORDER BY c.title",
      { id }
    );
    return result.records.map((r) => toTopic(r.get("c")));
  }

  async getRoots(): Promise<Topic[]> {
    const result = await this.run(
      "MATCH (t:Topic) WHERE NOT ()-[:HAS_SUBTOPIC]->(t) RETURN t ORDER BY t.title"
    );
    return result.records.map((r) => toTopic(r.get("t")));
  }

  async search(query: string): Promise<Topic[]> {
    const result = await this.run(
      `MATCH (t:Topic)
       WHERE toLower(t.title) CONTAINS toLower($q) OR toLower(coalesce(t.description, '')) CONTAINS toLower($q)
       RETURN t LIMIT 50`,
      { q: query || "" }
    );
    return result.records.map((r) => toTopic(r.get("t")));
  }

  async create(topic: Topic, parentId?: string): Promise<Topic> {
    const result = await this.run(
      "MERGE (t:Topic {id: $id}) SET t += $props RETURN t",
      { id: topic.id, props: toProps(topic) }
    );
    const created = toTopic(result.records[0].get("t"));
    if (parentId) await this.addChild(parentId, created.id);
    return created;
  }

  async update(topic: Topic): Promise<Topic> {
    const result = await this.run(
      "MATCH (t:Topic {id: $id}) SET t += $props RETURN t",
      { id: topic.id, props: toProps(topic) }
    );
    if (result.records.length === 0) throw new Error("Topic not found");
    return toTopic(result.records[0].get("t"));
  }

  async delete(id: string): Promise<void> {
    await this.run("MATCH (t:Topic {id: $id}) DETACH DELETE t", { id });
  }

  async addChild(parentId: string, childId: string): Promise<void> {
    const result = await this.run(
      `MATCH (p:Topic {id: $parentId}), (c:Topic {id: $childId})
       MERGE (p)-[:HAS_SUBTOPIC]->(c)
       RETURN p, c`,
      { parentId, childId }
    );
    if (result.records.length === 0) throw new Error("Parent or child not found");
  }
}
