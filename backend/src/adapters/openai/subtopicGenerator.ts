import { Topic } from "../../domain/types";

export type SubtopicGenerator = (parent: Topic) => Promise<Pick<Topic, "title" | "description">[]>;

export const openAiSubtopicGenerator: SubtopicGenerator = async (parent) => {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You build a knowledge graph. Given a topic, return its 5-10 most important direct subtopics as JSON: {"subtopics":[{"title":string,"description":string}]}. Descriptions are 1-2 sentences. Return an empty list if the topic is atomic.',
        },
        {
          role: "user",
          content: `Topic: ${parent.title}\nDescription: ${parent.description ?? ""}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const parsed = JSON.parse(data.choices[0].message.content);
  return (parsed.subtopics ?? []).filter((s: any) => typeof s?.title === "string" && s.title.trim());
};
