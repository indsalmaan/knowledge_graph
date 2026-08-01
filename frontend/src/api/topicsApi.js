const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path) {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Request to ${path} failed: ${res.status}`);
  }
  return res.json();
}

export function getGraphView(id) {
  return request(`/topics/${encodeURIComponent(id)}/graph`);
}

export function getTopic(id) {
  return request(`/topics/${encodeURIComponent(id)}`);
}

export function searchTopics(query) {
  return request(`/topics?q=${encodeURIComponent(query)}`);
}
