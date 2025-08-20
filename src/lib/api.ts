// frontend/src/lib/api.ts
const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8001";
console.log(import.meta.env);

export type Memory = {
    id: number;
    user_id: number;
    title: string;
    desc: string;
    emotion?: string;
    unlock_at_iso?: string | null;
    media_path?: string | null;
    media_type?: string | null;
};

export async function listMemories(userId: number): Promise<Memory[]> {
    const r = await fetch(`${BASE}/api/memories?user_id=${userId}`);
    if (!r.ok) throw new Error("listMemories failed");
    return r.json();
}

export async function searchMemories(params: {
    userId: number;
    q?: string;
    emotion?: string;
    date_from?: string;
    date_to?: string;
}): Promise<Memory[]> {
    const qs = new URLSearchParams({
        user_id: String(params.userId),
        ...(params.q ? { q: params.q } : {}),
        ...(params.emotion ? { emotion: params.emotion } : {}),
        ...(params.date_from ? { date_from: params.date_from } : {}),
        ...(params.date_to ? { date_to: params.date_to } : {}),
    });
    const r = await fetch(`${BASE}/api/memories/search?${qs.toString()}`);
    if (!r.ok) throw new Error("searchMemories failed");
    return r.json();
}

export async function createMemory(args: {
    userId: number;
    title: string;
    desc?: string;
    unlock_at_iso?: string;
    emotion?: string;
    file?: File;
}) {
    const fd = new FormData();
    fd.append("user_id", String(args.userId));
    fd.append("title", args.title);
    if (args.desc) fd.append("desc", args.desc);
    if (args.unlock_at_iso) fd.append("unlock_at_iso", args.unlock_at_iso);
    if (args.emotion) fd.append("emotion", args.emotion);
    if (args.file) fd.append("file", args.file);

    const r = await fetch(`${BASE}/api/memories`, { method: "POST", body: fd });
    if (!r.ok) throw new Error("createMemory failed");
    return r.json();
}

export function mediaUrl(path: string) {
    // Backed by FastAPI StaticFiles at /media
    return `${BASE}/media/${path}`;
}
