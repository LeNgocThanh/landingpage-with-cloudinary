"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  id: number;
  url: string;
  title: string | null;
  position: number;
  anchor: string;
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function GalleryClient({ items }: { items: Item[] }) {
  // ===== Menu overlay =====
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuQuery, setMenuQuery] = useState("");

  const menuItemsAll = useMemo(
    () => items.filter((x) => (x.title ?? "").trim().length > 0),
    [items]
  );

  const menuItems = useMemo(() => {
    const q = norm(menuQuery);
    if (!q) return menuItemsAll;
    return menuItemsAll.filter((x) => norm(x.title || "").includes(q));
  }, [menuItemsAll, menuQuery]);

  // highlight section currently in view
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (!items.length) return;

    const ids = items.map((x) => x.anchor);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // chọn entry gần top nhất (intersection)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));

        if (visible[0]?.target?.id) setActiveAnchor(visible[0].target.id);
      },
      {
        root: null,
        // “trúng” khi section đi qua vùng đầu trang
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0, 0.1, 0.2, 0.35],
      }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  function scrollToAnchor(anchor: string) {
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setMenuOpen(false);
  }

  // ===== Lightbox =====
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : items[activeIndex];

  const stageRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  // Pointer tracking for pan + pinch
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    mode: "none" | "pan" | "pinch";
    // pan
    panStart: { x: number; y: number };
    pointerStart: { x: number; y: number };
    // pinch
    pinchStartDist: number;
    pinchStartZoom: number;
    pinchStartCenter: { x: number; y: number };
    pinchStartPan: { x: number; y: number };
  }>({
    mode: "none",
    panStart: { x: 0, y: 0 },
    pointerStart: { x: 0, y: 0 },
    pinchStartDist: 0,
    pinchStartZoom: 1,
    pinchStartCenter: { x: 0, y: 0 },
    pinchStartPan: { x: 0, y: 0 },
  });

  // Double tap/click detection (single pointer)
  const lastTapRef = useRef(0);

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function openLightbox(i: number) {
    setActiveIndex(i);
    resetView();
  }

  function closeLightbox() {
    setActiveIndex(null);
    resetView();
    pointers.current.clear();
    gesture.current.mode = "none";
  }

  function prev() {
    if (activeIndex === null) return;
    openLightbox((activeIndex - 1 + items.length) % items.length);
  }

  function next() {
    if (activeIndex === null) return;
    openLightbox((activeIndex + 1) % items.length);
  }

  function zoomIn() {
    const z1 = clamp(Number((zoomRef.current + 0.25).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
    setZoom(z1);
  }

  function zoomOut() {
    const z1 = clamp(Number((zoomRef.current - 0.25).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
    setZoom(z1);
    if (z1 <= 1.01) setPan({ x: 0, y: 0 });
  }

  // clamp pan so user doesn't drag forever
  function clampPan(next: { x: number; y: number }, z = zoomRef.current) {
    const el = stageRef.current;
    if (!el) return next;

    const rect = el.getBoundingClientRect();

    const extraX = (rect.width * (z - 1)) / 2;
    const extraY = (rect.height * (z - 1)) / 2;

    const pad = 52;
    const minX = -(extraX + pad);
    const maxX = extraX + pad;
    const minY = -(extraY + pad);
    const maxY = extraY + pad;

    return { x: clamp(next.x, minX, maxX), y: clamp(next.y, minY, maxY) };
  }

  // Zoom to a specific point (client coords), keep that point stable
  function zoomToPoint(targetZoom: number, pointClient: { x: number; y: number }) {
    const el = stageRef.current;
    const z0 = zoomRef.current;
    const z1 = clamp(targetZoom, MIN_ZOOM, MAX_ZOOM);

    if (!el) {
      setZoom(z1);
      if (z1 <= 1.01) setPan({ x: 0, y: 0 });
      return;
    }

    const rect = el.getBoundingClientRect();
    const cx = pointClient.x - rect.left - rect.width / 2;
    const cy = pointClient.y - rect.top - rect.height / 2;

    const p0 = panRef.current;
    const nx = p0.x + cx * (1 - z1 / z0);
    const ny = p0.y + cy * (1 - z1 / z0);

    setZoom(z1);
    if (z1 <= 1.01) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan(clampPan({ x: nx, y: ny }, z1));
    }
  }

  function toggleZoomAt(pointClient: { x: number; y: number }) {
    // 1x <-> 2.5x
    const target = zoomRef.current <= 1.05 ? 2.5 : 1;
    zoomToPoint(target, pointClient);
  }

  // wheel zoom (desktop)
  function onWheelZoom(e: React.WheelEvent) {
    if (!active) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? -0.18 : 0.18;
    const z0 = zoomRef.current;
    const z1 = clamp(Number((z0 + delta).toFixed(2)), MIN_ZOOM, MAX_ZOOM);
    zoomToPoint(z1, { x: e.clientX, y: e.clientY });
  }

  // ===== Swipe to change image (mobile & desktop touch) =====
  const swipe = useRef({
    enabled: false,
    startX: 0,
    startY: 0,
    moved: false,
  });

  function onSwipeStart(e: React.PointerEvent) {
    // only with 1 pointer and when NOT pinching
    if (pointers.current.size !== 1) return;
    swipe.current.enabled = true;
    swipe.current.startX = e.clientX;
    swipe.current.startY = e.clientY;
    swipe.current.moved = false;
  }

  function onSwipeMove(e: React.PointerEvent) {
    if (!swipe.current.enabled) return;
    const dx = e.clientX - swipe.current.startX;
    const dy = e.clientY - swipe.current.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) swipe.current.moved = true;

    // Nếu đang zoom>1 thì ưu tiên pan, không swipe chuyển ảnh
    if (zoomRef.current > 1.01) return;

    // Khi chưa zoom: nếu kéo ngang rõ rệt -> chặn scroll trang (touchAction none đã làm)
    // Không cần setPan ở đây.
  }

  function onSwipeEnd(e: React.PointerEvent) {
    if (!swipe.current.enabled) return;
    swipe.current.enabled = false;

    // Nếu đang zoom>1 => không chuyển ảnh
    if (zoomRef.current > 1.01) return;

    const dx = e.clientX - swipe.current.startX;
    const dy = e.clientY - swipe.current.startY;

    // tránh nhầm với kéo dọc
    if (Math.abs(dx) < 60) return;
    if (Math.abs(dy) > 80) return;

    if (dx > 0) prev();
    else next();
  }

  function cdnAuto(url: string) {
    return url.replace("/upload/", "/upload/c_fill,g_auto,q_auto,f_auto/");
  }

  // Pointer events: pan + pinch
  function onPointerDown(e: React.PointerEvent) {
    if (!active) return;

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

    const now = Date.now();
    const dt = now - lastTapRef.current;
    lastTapRef.current = now;

    // double tap/click (only if single pointer)
    if (pointers.current.size === 1 && dt > 0 && dt < 280) {
      toggleZoomAt({ x: e.clientX, y: e.clientY });
      return;
    }

    if (pointers.current.size === 1) {
      // start swipe tracker too
      onSwipeStart(e);

      // start pan only if zoom > 1
      if (zoomRef.current <= 1.01) {
        gesture.current.mode = "none";
        return;
      }
      gesture.current.mode = "pan";
      gesture.current.pointerStart = { x: e.clientX, y: e.clientY };
      gesture.current.panStart = { ...panRef.current };
    } else if (pointers.current.size === 2) {
      // pinch
      swipe.current.enabled = false;

      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;

      const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

      gesture.current.mode = "pinch";
      gesture.current.pinchStartDist = dist;
      gesture.current.pinchStartZoom = zoomRef.current;
      gesture.current.pinchStartCenter = center;
      gesture.current.pinchStartPan = { ...panRef.current };
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!active) return;
    if (!pointers.current.has(e.pointerId)) return;

    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // swipe tracking (when zoom ~ 1)
    if (pointers.current.size === 1) onSwipeMove(e);

    const mode = gesture.current.mode;

    if (mode === "pan") {
      if (zoomRef.current <= 1.01) return;

      const dx = e.clientX - gesture.current.pointerStart.x;
      const dy = e.clientY - gesture.current.pointerStart.y;

      const next = { x: gesture.current.panStart.x + dx, y: gesture.current.panStart.y + dy };
      setPan(clampPan(next, zoomRef.current));
      return;
    }

    if (mode === "pinch") {
      if (pointers.current.size < 2) return;

      const pts = Array.from(pointers.current.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      const dist = Math.hypot(dx, dy) || 1;

      const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

      const scale = dist / (gesture.current.pinchStartDist || 1);
      const z0 = gesture.current.pinchStartZoom;
      const z1 = clamp(Number((z0 * scale).toFixed(3)), MIN_ZOOM, MAX_ZOOM);

      // allow two-finger drag
      const c0 = gesture.current.pinchStartCenter;
      const centerDx = center.x - c0.x;
      const centerDy = center.y - c0.y;

      const stage = stageRef.current;
      if (!stage) {
        setZoom(z1);
        return;
      }
      const rect = stage.getBoundingClientRect();
      const relCx = center.x - rect.left - rect.width / 2;
      const relCy = center.y - rect.top - rect.height / 2;

      const p0 = gesture.current.pinchStartPan;

      const nx = p0.x + centerDx + relCx * (1 - z1 / z0);
      const ny = p0.y + centerDy + relCy * (1 - z1 / z0);

      setZoom(z1);
      if (z1 <= 1.01) setPan({ x: 0, y: 0 });
      else setPan(clampPan({ x: nx, y: ny }, z1));
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    // if single pointer swipe end
    if (pointers.current.size === 1) onSwipeEnd(e);

    pointers.current.delete(e.pointerId);

    if (pointers.current.size === 0) {
      gesture.current.mode = "none";
      return;
    }

    // pinch ended -> maybe switch to pan if still zoomed
    if (pointers.current.size === 1) {
      const pt = Array.from(pointers.current.values())[0];
      if (zoomRef.current > 1.01) {
        gesture.current.mode = "pan";
        gesture.current.pointerStart = { x: pt.x, y: pt.y };
        gesture.current.panStart = { ...panRef.current };
      } else {
        gesture.current.mode = "none";
      }
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    swipe.current.enabled = false;
    if (pointers.current.size === 0) gesture.current.mode = "none";
  }

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (activeIndex !== null) {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "+" || e.key === "=") zoomIn();
        if (e.key === "-") zoomOut();
        if (e.key.toLowerCase() === "r") resetView();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // lock body scroll while lightbox open
  useEffect(() => {
    if (activeIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

  // focus search input when menu opens
  const menuInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (menuOpen) {
      setTimeout(() => menuInputRef.current?.focus(), 0);
    }
  }, [menuOpen]);

  // ===== Render =====
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      {/* Sticky top bar */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid #eee",
          padding: "10px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button onClick={() => setMenuOpen((v) => !v)} style={btnStyle}>
          {menuOpen ? "Đóng Menu" : "Mở Menu"}
        </button>

        <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Lều Mây</div>
       
      </div>

      {/* Overlay menu */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 40,
            background: "rgba(0,0,0,0.38)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "absolute",
              left: 16,
              top: 64,
              width: "min(620px, calc(100vw - 32px))",
              maxHeight: "calc(100vh - 90px)",
              overflow: "auto",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #eee",
              boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              padding: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>Danh sách</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                ({menuItemsAll.length} ảnh có title)
              </div>

              <button onClick={() => setMenuOpen(false)} style={{ ...btnStyle, marginLeft: "auto" }}>
                ✕
              </button>
            </div>

            {/* Search */}
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <input
                ref={menuInputRef}
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
                placeholder="Tìm theo title…"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid #e7e7e7",
                  outline: "none",
                }}
              />
              <button
                onClick={() => setMenuQuery("")}
                style={{ ...btnStyle, opacity: menuQuery ? 1 : 0.5 }}
                disabled={!menuQuery}
                title="Xóa tìm kiếm"
              >
                Xóa
              </button>
            </div>

            {/* List */}
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {menuItems.map((x) => {
                const isActive = activeAnchor === x.anchor;
                return (
                  <button
                    key={x.id}
                    onClick={() => scrollToAnchor(x.anchor)}
                    style={{
                      textAlign: "left",
                      padding: 12,
                      borderRadius: 14,
                      border: isActive ? "1px solid #111" : "1px solid #eee",
                      background: isActive ? "rgba(0,0,0,0.04)" : "#fff",
                      cursor: "pointer",
                      display: "grid",
                      gridTemplateColumns: "54px 1fr",
                      gap: 10,
                      alignItems: "start",
                    }}
                  >
                    {/* <div
                      style={{
                        fontWeight: 900,
                        fontSize: 12,
                        opacity: 0.7,
                        paddingTop: 2,
                      }}
                    >
                      {String(x.position || 0).padStart(2, "0")}
                    </div> */}
                    <div>
                      <div style={{ fontWeight: 800, lineHeight: 1.15 }}>{x.title}</div>                     
                    </div>
                  </button>
                );
              })}

              {menuItems.length === 0 ? (
                <div style={{ padding: 10, opacity: 0.75 }}>
                  Không có kết quả phù hợp.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Landing list: mỗi ảnh 1 dòng */}
      <div style={{ marginTop: 16, display: "grid", gap: 18 }}>
        {items.map((x, i) => {
          const isActive = activeAnchor === x.anchor;
          return (
            <section
              key={x.id}
              id={x.anchor}
              style={{
                border: isActive ? "1px solid #111" : "1px solid #eee",
                borderRadius: 18,
                overflow: "hidden",
                background: "#fff",
                boxShadow: isActive ? "0 10px 30px rgba(0,0,0,0.08)" : "none",
              }}
            >
              <div
                style={{
                  padding: 12,
                  borderBottom: "1px solid #f2f2f2",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 13, opacity: 0.65, minWidth: 42 }}>
                  {String(x.position || 0).padStart(2, "0")}
                </div>
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  {x.title?.trim() ? x.title : "—"}
                </div>
              </div>

              <button
                onClick={() => openLightbox(i)}
                style={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  padding: 0,
                  background: "transparent",
                  cursor: "zoom-in",
                }}
                aria-label={`Open image ${x.title ?? x.anchor}`}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                  <Image
                    src={cdnAuto(x.url)}
                    alt={x.title ?? "image"}
                    fill
                    sizes="(max-width: 980px) 100vw, 980px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              </button>
            </section>
          );
        })}
      </div>

      {/* Lightbox */}
      {active ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.90)",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", padding: 12, color: "#fff" }}>
            <div style={{ fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {active.title?.trim() ? active.title : active.anchor}
            </div>

            <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={prev} style={lbBtnStyle}>←</button>
              <button onClick={next} style={lbBtnStyle}>→</button>
              <button onClick={zoomOut} style={lbBtnStyle}>−</button>
              <button onClick={zoomIn} style={lbBtnStyle}>＋</button>
              <button onClick={resetView} style={lbBtnStyle}>Reset</button>
              <button onClick={closeLightbox} style={lbBtnStyle}>✕</button>
            </div>
          </div>

          <div
            ref={stageRef}
            onWheel={onWheelZoom}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{
              position: "relative",
              overflow: "hidden",
              userSelect: "none",
              touchAction: "none", // quan trọng cho mobile pinch/pan/swipe
              cursor: zoom > 1.01 ? (gesture.current.mode === "pan" ? "grabbing" : "grab") : "default",
            }}
            onDoubleClick={(e) => toggleZoomAt({ x: e.clientX, y: e.clientY })}
            onClick={() => {
              // click nền để đóng nếu zoom ~ 1 (tránh đóng khi đang zoom/pan)
              if (gesture.current.mode === "none" && zoomRef.current <= 1.01) closeLightbox();
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                transition: gesture.current.mode === "none" ? "transform 70ms linear" : "none",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src={active.url}
                  alt={active.title ?? "image"}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            </div>
          </div>

          <div style={{ padding: 10, color: "rgba(255,255,255,0.80)", fontSize: 12 }}>
            Tip: Pinch 2 ngón để zoom • Vuốt/kéo để pan khi zoom &gt; 1 • Vuốt ngang (khi zoom=1) để chuyển ảnh • Double tap/click để zoom nhanh • ESC để đóng
          </div>
        </div>
      ) : null}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  cursor: "pointer",
};

const lbBtnStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.22)",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  cursor: "pointer",
};
