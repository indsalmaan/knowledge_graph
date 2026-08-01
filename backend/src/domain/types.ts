export interface Topic {
  id: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface GraphView {
  node: Topic;
  children: Topic[];
}

export type ID = string;
