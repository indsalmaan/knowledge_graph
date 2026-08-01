import dotenv from "dotenv";
import { Topic } from "../domain/types";
import { Neo4jTopicRepository } from "../adapters/neo4j/neo4jAdapter";
import { TopicService } from "../application/topicService";
import { closeNeo4jDriver } from "../adapters/neo4j/driver";

dotenv.config();

interface SeedNode {
  id: string;
  title: string;
  description: string;
  children?: SeedNode[];
}

const tree: SeedNode = {
  id: "root",
  title: "All Human Knowledge",
  description:
    "The root of the knowledge graph. Every field of human understanding branches from here.",
  children: [
    {
      id: "thermodynamics",
      title: "Thermodynamics",
      description:
        "The branch of physics concerned with heat, work, temperature, and energy, and the laws describing how they interconvert.",
      children: [
        {
          id: "laws-of-thermodynamics",
          title: "Laws of Thermodynamics",
          description:
            "Four fundamental laws that define physical quantities (temperature, energy, entropy) and describe how systems exchange energy.",
          children: [
            {
              id: "zeroth-law",
              title: "Zeroth Law",
              description:
                "If two systems are each in thermal equilibrium with a third, they are in thermal equilibrium with each other. Establishes temperature as a well-defined quantity.",
            },
            {
              id: "first-law",
              title: "First Law",
              description:
                "Energy cannot be created or destroyed, only converted from one form to another. Formalized as dU = Q - W.",
            },
            {
              id: "second-law",
              title: "Second Law",
              description:
                "The total entropy of an isolated system can never decrease over time. Explains the irreversibility of natural processes and the arrow of time.",
            },
            {
              id: "third-law",
              title: "Third Law",
              description:
                "As a system's temperature approaches absolute zero, its entropy approaches a constant minimum.",
            },
          ],
        },
        {
          id: "thermodynamic-systems",
          title: "Thermodynamic Systems",
          description:
            "Classification of matter and energy under study as open, closed, or isolated systems, each with different exchange rules with their surroundings.",
        },
        {
          id: "thermodynamic-processes",
          title: "Thermodynamic Processes",
          description:
            "Ways a system moves between states: isothermal, adiabatic, isobaric, and isochoric processes.",
        },
        {
          id: "entropy",
          title: "Entropy",
          description:
            "A measure of disorder or the number of microscopic configurations consistent with a system's macroscopic state. Central to the Second Law.",
        },
        {
          id: "heat-engines",
          title: "Heat Engines & Refrigerators",
          description:
            "Devices that convert heat into work (engines) or use work to move heat against a gradient (refrigerators/heat pumps), bounded by Carnot efficiency.",
        },
        {
          id: "thermodynamic-potentials",
          title: "Thermodynamic Potentials",
          description:
            "State functions such as Enthalpy, Helmholtz free energy, and Gibbs free energy used to predict spontaneity and equilibrium under different constraints.",
        },
        {
          id: "phase-transitions",
          title: "Phase Transitions",
          description:
            "Transformations between states of matter (solid, liquid, gas, plasma) driven by changes in temperature, pressure, or other thermodynamic variables.",
        },
      ],
    },
  ],
};

async function seedNode(service: TopicService, node: SeedNode, parentId?: string) {
  const topic: Topic = {
    id: node.id,
    title: node.title,
    description: node.description,
  };
  await service.create(topic, parentId);
  console.log(`Seeded: ${node.title}${parentId ? ` (under ${parentId})` : ""}`);
  for (const child of node.children || []) {
    await seedNode(service, child, node.id);
  }
}

async function main() {
  const repo = new Neo4jTopicRepository();
  const service = new TopicService(repo);
  await seedNode(service, tree);
  await closeNeo4jDriver();
  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
