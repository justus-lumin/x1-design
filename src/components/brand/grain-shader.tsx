"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * GrainShader: the X1 "soft monochrome" field.
 * Slow, soft folds of light (like draped fabric under a window) with fine, static film grain.
 * The light leans toward the pointer and drifts on its own when idle.
 * Colors come from the --grain-lo / --grain-hi tokens, so it follows light and dark themes.
 * Raw WebGL1, no dependencies.
 *
 * Robustness (the shader must never show a broken canvas):
 * - Each effect run creates its OWN canvas element, so React's dev double-mount can't reuse a lost context.
 * - A WebGL context only exists while the shader is near the viewport; it is released when far away,
 *   so a page with many shaders never hits the browser's context limit.
 * - Context loss is handled: the canvas is dropped and rebuilt.
 * - Underneath sits a CSS approximation (light pool + SVG grain), so a missing or slow GL still looks right.
 * - Reduced motion renders a single still frame.
 */

export type GrainShaderProps = {
  className?: string;
  /** Direction the light comes from, in degrees. 0 = right, 90 = top. */
  angle?: number;
  /** How much of the field is lit, 0..1. */
  light?: number;
  /** Grain strength, 0..0.2. */
  grain?: number;
  /** Fold contrast, 0..1. */
  folds?: number;
  /** Light follows the pointer. */
  interactive?: boolean;
  speed?: number;
};

const VERT = `
attribute vec2 p;
void main(){ gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_mouseAmt;
uniform vec2  u_dir;
uniform float u_light;
uniform float u_grain;
uniform float u_folds;
uniform float u_dpr;
uniform vec3  u_lo;
uniform vec3  u_hi;

// Dave Hoskins hash: no lattice artifacts at pixel scale.
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * vnoise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 q = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  float t = u_time;

  // Pointer gently bends the cloth toward itself.
  vec2 toM = m - q;
  q += toM * 0.18 * u_mouseAmt * exp(-dot(toM, toM) * 1.6);

  // Low-frequency warp: slow, never busy.
  vec2 w = vec2(fbm(q * 0.9 + vec2(t * 0.025, -t * 0.018)), fbm(q * 0.9 + vec2(-t * 0.02, t * 0.022) + 5.3)) - 0.5;
  vec2 qw = q + w * 0.65;

  vec2 dir = normalize(u_dir);
  vec2 perp = vec2(-dir.y, dir.x);
  float along = dot(qw, dir) / max(aspect, 1.0);
  float across = dot(qw, perp);

  // Base light ramp.
  float base = smoothstep(-0.55, 0.65, along + (u_light - 0.5) * 1.2);

  // Folds: two soft creases running across the light, drifting slowly.
  float f1 = sin(across * 3.1 + along * 1.4 + t * 0.12 + w.x * 3.0);
  float f2 = sin(across * 5.3 - along * 2.2 - t * 0.09 + w.y * 4.0);
  float fold = (f1 * 0.65 + f2 * 0.35) * 0.5 + 0.5;
  fold = smoothstep(0.15, 0.95, fold);

  float c = base * mix(1.0, 0.45 + 0.75 * fold, u_folds);

  // Pointer light.
  float pool = exp(-dot(q - m, q - m) * 2.4) * u_mouseAmt;
  c += pool * 0.28 * (1.0 - c * 0.5);

  c = clamp(c, 0.0, 1.0);
  c = c * c * (3.0 - 2.0 * c) * 0.85 + c * 0.15; // soft contrast

  // Static film grain, fixed to the pixel grid: texture, not static.
  float g = hash(floor(frag / u_dpr)) - 0.5;
  float g2 = hash(floor(frag / u_dpr) + 17.17) - 0.5;
  c += (g + g2) * u_grain * (0.35 + 0.65 * (4.0 * c * (1.0 - c)) + 0.25);

  vec3 col = mix(u_lo, u_hi, clamp(c, 0.0, 1.0));
  gl_FragColor = vec4(col, 1.0);
}
`;

function cssColor(el: Element, name: string): [number, number, number] {
  const v = getComputedStyle(el).getPropertyValue(name).trim();
  const hex = v.startsWith("#") ? v.slice(1) : "000000";
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

// Static film grain for the CSS fallback layer.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 0 0.5 0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.55'/></svg>\")";

type GL = WebGLRenderingContext;

function buildProgram(gl: GL) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  return prog;
}

export function GrainShader({
  className,
  angle = 35,
  light = 0.5,
  grain = 0.09,
  folds = 0.7,
  interactive = false,
  speed = 1,
}: GrainShaderProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rad = (angle * Math.PI) / 180;
    const t0 = performance.now();
    const mouse = { x: 0.7, y: 0.6, tx: 0.7, ty: 0.6, amt: 0, tamt: 0, active: false };

    let canvas: HTMLCanvasElement | null = null;
    let gl: GL | null = null;
    let uni: Record<string, WebGLUniformLocation | null> = {};
    let raf = 0;
    let visible = false;
    let disposed = false;

    const setColors = () => {
      if (!gl || !canvas) return;
      gl.uniform3fv(uni.lo, cssColor(host, "--grain-lo"));
      gl.uniform3fv(uni.hi, cssColor(host, "--grain-hi"));
    };

    const resize = () => {
      if (!gl || !canvas) return;
      const { width, height } = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.res, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      if (!gl || gl.isContextLost()) return;
      const t = ((now - t0) / 1000) * speed;
      if (!mouse.active) {
        // Idle drift: the light wanders slowly on its own.
        mouse.tx = 0.62 + Math.sin(t * 0.13) * 0.22;
        mouse.ty = 0.55 + Math.cos(t * 0.1) * 0.2;
        if (interactive) mouse.tamt = Math.max(mouse.tamt, 0.35);
      }
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      mouse.amt += (mouse.tamt - mouse.amt) * 0.03;
      gl.uniform1f(uni.time, reduced ? 20 : t);
      gl.uniform2f(uni.mouse, mouse.x, mouse.y);
      gl.uniform1f(uni.mouseAmt, mouse.amt);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      draw(now);
      if (!reduced && visible) raf = requestAnimationFrame(loop);
    };

    const release = () => {
      cancelAnimationFrame(raf);
      if (canvas) {
        canvas.removeEventListener("webglcontextlost", onLost);
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
        canvas.remove();
      }
      canvas = null;
      gl = null;
    };

    function onLost(e: Event) {
      e.preventDefault();
      release();
      // Rebuild on the next frame if we're still on screen.
      if (!disposed && visible) requestAnimationFrame(() => acquire());
    }

    const acquire = () => {
      if (disposed || canvas) return;
      const c = document.createElement("canvas");
      c.className = "absolute inset-0 size-full opacity-0 transition-opacity duration-700";
      c.setAttribute("aria-hidden", "true");
      const ctx = c.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" }) as GL | null;
      if (!ctx || ctx.isContextLost()) return; // CSS fallback stays.
      const prog = buildProgram(ctx);
      if (!prog) return;
      canvas = c;
      gl = ctx;
      const u = (n: string) => ctx.getUniformLocation(prog, n);
      uni = {
        res: u("u_res"), time: u("u_time"), mouse: u("u_mouse"), mouseAmt: u("u_mouseAmt"),
        lo: u("u_lo"), hi: u("u_hi"),
      };
      ctx.uniform2f(u("u_dir"), Math.cos(rad), Math.sin(rad));
      ctx.uniform1f(u("u_light"), light);
      ctx.uniform1f(u("u_grain"), grain);
      ctx.uniform1f(u("u_folds"), folds);
      ctx.uniform1f(u("u_dpr"), dpr);
      c.addEventListener("webglcontextlost", onLost);
      host.appendChild(c);
      resize();
      setColors();
      draw(performance.now());
      // Only reveal once a real frame exists.
      requestAnimationFrame(() => {
        if (canvas === c) c.style.opacity = "1";
      });
      if (!reduced && visible) raf = requestAnimationFrame(loop);
    };

    // Near the viewport: hold a context and animate. Far away: give the context back.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (!canvas) acquire();
          else if (!reduced) {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(loop);
          }
        } else {
          release();
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(performance.now());
    });
    ro.observe(host);

    const mo = new MutationObserver(() => {
      setColors();
      draw(performance.now());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const stage = host.parentElement; // the wrapper is pointer-events-none; listen on its section
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.tamt = 1;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.tamt = 0.35;
      mouse.active = false;
    };
    if (interactive && stage) {
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
    }

    return () => {
      disposed = true;
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      if (interactive && stage) {
        stage.removeEventListener("pointermove", onMove);
        stage.removeEventListener("pointerleave", onLeave);
      }
      release();
    };
  }, [angle, light, grain, folds, interactive, speed]);

  // CSS approximation of the field: a soft light pool on the token colors plus static grain.
  const lx = 50 + Math.cos((angle * Math.PI) / 180) * 30;
  const ly = 50 - Math.sin((angle * Math.PI) / 180) * 30;
  return (
    <div
      ref={ref}
      aria-hidden
      data-grain=""
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        backgroundColor: "var(--grain-lo)",
        backgroundImage: `${GRAIN_SVG}, radial-gradient(90% 80% at ${lx}% ${ly}%, color-mix(in srgb, var(--grain-hi) ${Math.round(40 + light * 50)}%, transparent) 0%, transparent 75%)`,
        backgroundBlendMode: "overlay, normal",
      }}
    />
  );
}
