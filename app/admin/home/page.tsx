"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Item = {
  id: number;
  url: string;
  title: string | null;
  position: number;
  anchor: string;
  createdAt: string;
};

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.position - b.position || a.id - b.id),
    [items]
  );

  async function load() {
    const res = await fetch("/api/cloudinary", { cache: "no-store" });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function upload() {
    if (!file) return;
    setBusy(true);
    setMsg("");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("position", String(position));

      const res = await fetch("/api/cloudinary", { method: "POST", body: fd });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e?.error || "Upload thất bại");
      }

      setFile(null);
      setTitle("");
      setPosition(0);
      await load();
      setMsg("Đã upload ✅");
    } catch (e: any) {
      setMsg(e?.message || "Có lỗi");
    } finally {
      setBusy(false);
    }
  }

  // Update: dùng PUT cho đồng bộ với route handler (khuyến nghị)
  async function updateItem(
    id: number,
    patch: Partial<Pick<Item, "title" | "position">>
  ) {
    const res = await fetch(`/api/cloudinary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    await load();
  }

  async function del(id: number) {
    if (!confirm("Xoá bản ghi ảnh?")) return;
    const res = await fetch(`/api/cloudinary/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    await load();
  }

  return (
    <div style={{ maxWidth: 1100, margin: "24px auto", padding: 16 }}>
      <h1>Admin - Ảnh Landing</h1>

      <div style={{ border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
        <h3>Upload ảnh</h3>

        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <label>
            File ảnh
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={busy}
            />
          </label>

          <label>
            Vị trí (position)
            <input
              type="number"
              value={position}
              onChange={(e) => setPosition(Number(e.target.value))}
              disabled={busy}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Title (có thể bỏ trống)
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              placeholder="VD: Ảnh lễ ký kết..."
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <button onClick={upload} disabled={!file || busy} style={{ marginTop: 12 }}>
          {busy ? "Đang upload..." : "Upload"}
        </button>

        {msg ? <div style={{ marginTop: 10 }}>{msg}</div> : null}
      </div>

      <div style={{ marginTop: 18 }}>
        <h3>Danh sách ảnh</h3>

        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((x) => (
            <div
              key={x.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                {/* Thumbnail bằng next/image để tránh tải full */}
                <div
                  style={{
                    position: "relative",
                    width: 220,
                    height: 140,
                    borderRadius: 10,
                    overflow: "hidden",
                    flex: "0 0 auto",
                    background: "#f3f3f3",
                  }}
                >
                  <Image
                    src={x.url}
                    alt={x.title ?? "image"}
                    fill
                    sizes="220px"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    id={x.id} • anchor={x.anchor}
                  </div>

                  <label style={{ display: "block", marginTop: 8 }}>
                    Title
                    <input
                      defaultValue={x.title ?? ""}
                      onBlur={(e) => updateItem(x.id, { title: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </label>

                  <label style={{ display: "block", marginTop: 8 }}>
                    Position
                    <input
                      type="number"
                      defaultValue={x.position}
                      onBlur={(e) =>
                        updateItem(x.id, { position: Number(e.target.value) })
                      }
                      style={{ width: 160 }}
                    />
                  </label>

                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                    <a href={x.url} target="_blank" rel="noreferrer">
                      Mở ảnh
                    </a>

                    <button
                      onClick={() => del(x.id)}
                      style={{ marginLeft: "auto" }}
                      disabled={busy}
                    >
                      Xoá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {sorted.length === 0 ? <div>Chưa có ảnh.</div> : null}
        </div>
      </div>
    </div>
  );
}
