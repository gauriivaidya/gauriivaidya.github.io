import { useEffect, useRef } from "react";

/** Abstract drifting node-link texture (~1.5 KB). Pauses offscreen / in hidden tabs; static frame under reduced motion. */
export function NetworkField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!, x = c.getContext("2d")!;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, on = true, seen = true;
    type P = { x: number; y: number; vx: number; vy: number };
    let ps: P[] = [];
    const size = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      w = c.clientWidth; h = c.clientHeight; c.width = w * d; c.height = h * d; x.setTransform(d, 0, 0, d, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 14000));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18 }));
    };
    const draw = (move = false) => {
      const col = getComputedStyle(c).color, R = 150;
      x.clearRect(0, 0, w, h); x.fillStyle = x.strokeStyle = col;
      if (move) for (const p of ps) { p.x = (p.x + p.vx + w) % w; p.y = (p.y + p.vy + h) % h; }
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const a = ps[i], b = ps[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < R) { x.globalAlpha = (1 - d / R) * .55; x.lineWidth = 1; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(b.x, b.y); x.stroke(); }
      }
      x.globalAlpha = .9;
      for (const p of ps) { x.beginPath(); x.arc(p.x, p.y, 2, 0, 7); x.fill(); }
    };
    const loop = () => { draw(true); if (on) raf = requestAnimationFrame(loop); };
    const go = (v: boolean) => { on = v && !document.hidden && !still; cancelAnimationFrame(raf); if (on) loop(); };
    size(); draw();
    const io = new IntersectionObserver(([e]) => go(seen = e.isIntersecting)); io.observe(c);
    const vis = () => go(seen), rs = () => { size(); draw(); };
    document.addEventListener("visibilitychange", vis); addEventListener("resize", rs);
    const mo = new MutationObserver(() => draw()); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { cancelAnimationFrame(raf); io.disconnect(); mo.disconnect(); document.removeEventListener("visibilitychange", vis); removeEventListener("resize", rs); };
  }, []);
  return <canvas ref={ref} className="net" aria-hidden="true" />;
}
