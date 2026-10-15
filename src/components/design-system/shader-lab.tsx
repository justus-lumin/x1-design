"use client";

import { useEffect, useState } from "react";
import { GrainShader, type GrainShaderProps } from "@/components/brand/grain-shader";
import { X1Mark } from "@/components/brand/logo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./parts";

type Params = Required<Omit<GrainShaderProps, "className">>;

// The presets are the prop sets actually used in the codebase (see design-system/tokens.json → shader.presets).
const PRESETS: Record<string, { label: string; where: string; p: Params }> = {
  hero: { label: "Hero", where: "sections/home/hero.tsx", p: { angle: 20, light: 0.55, grain: 0.09, folds: 0.75, interactive: true, speed: 1 } },
  cta: { label: "CTA band", where: "site/cta-band.tsx", p: { angle: 70, light: 0.3, grain: 0.09, folds: 0.8, interactive: true, speed: 1 } },
  default: { label: "Defaults", where: "brand/grain-shader.tsx", p: { angle: 35, light: 0.5, grain: 0.09, folds: 0.7, interactive: false, speed: 1 } },
};

const SLIDERS: { key: keyof Params; label: string; min: number; max: number; step: number; hint: string }[] = [
  { key: "angle", label: "angle", min: 0, max: 360, step: 1, hint: "Light direction in degrees. 0 = right, 90 = top" },
  { key: "light", label: "light", min: 0, max: 1, step: 0.01, hint: "How much of the field is lit" },
  { key: "folds", label: "folds", min: 0, max: 1, step: 0.01, hint: "Fold contrast" },
  { key: "grain", label: "grain", min: 0, max: 0.2, step: 0.005, hint: "Film grain strength" },
  { key: "speed", label: "speed", min: 0, max: 3, step: 0.1, hint: "Drift speed multiplier" },
];

const snippet = (p: Params) => {
  const d = PRESETS.default.p;
  const parts = (Object.keys(p) as (keyof Params)[])
    .filter((k) => p[k] !== d[k])
    .map((k) => (typeof p[k] === "boolean" ? (p[k] ? k : `${k}={false}`) : `${k}={${p[k]}}`));
  return `<div className="relative isolate overflow-hidden rounded-[var(--radius-tile)]">\n  <GrainShader${parts.length ? " " + parts.join(" ") : ""} />\n  <div className="relative">…content…</div>\n</div>`;
};

export function ShaderLab() {
  const [preset, setPreset] = useState("hero");
  const [draft, setDraft] = useState<Params>(PRESETS.hero.p);
  const [live, setLive] = useState<Params>(PRESETS.hero.p);

  // Each prop change rebuilds the WebGL program, so slider input is debounced.
  useEffect(() => {
    const t = setTimeout(() => setLive(draft), 180);
    return () => clearTimeout(t);
  }, [draft]);

  const choose = (k: string) => {
    setPreset(k);
    setDraft(PRESETS[k].p);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative isolate h-[22rem] overflow-hidden rounded-[var(--radius-tile)] md:h-[30rem]">
        <GrainShader {...live} />
        <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
          <span className="self-start rounded-full bg-background/60 px-3 py-1 font-mono text-data text-muted-foreground backdrop-blur">
            {PRESETS[preset]?.where ?? "custom"}
          </span>
          <X1Mark className="h-10 self-end text-foreground/80 md:h-14" />
        </div>
      </div>

      <div className="grid-12 gap-y-4">
        <div className="col-span-4 flex flex-col gap-5 rounded-[var(--radius-tile)] bg-card p-6 md:col-span-6">
          <Tabs value={preset} onValueChange={choose}>
            <TabsList className="max-w-full flex-wrap bg-background">
              {Object.entries(PRESETS).map(([k, v]) => (
                <TabsTrigger key={k} value={k} className="h-10">
                  {v.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="flex flex-col gap-4">
            {SLIDERS.map((s) => (
              <label key={s.key} className="flex flex-col gap-1.5">
                <span className="flex items-baseline justify-between gap-4">
                  <span className="font-mono text-data text-foreground">{s.label}</span>
                  <span className="font-mono text-data tabular-nums text-muted-foreground">{String(draft[s.key])}</span>
                </span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={draft[s.key] as number}
                  onChange={(e) => {
                    setPreset("");
                    setDraft((d) => ({ ...d, [s.key]: Number(e.target.value) }));
                  }}
                  className="h-8 w-full cursor-pointer accent-foreground"
                  aria-describedby={`hint-${s.key}`}
                />
                <span id={`hint-${s.key}`} className="text-data text-subtle">
                  {s.hint}
                </span>
              </label>
            ))}
            <label className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <input
                type="checkbox"
                checked={draft.interactive}
                onChange={(e) => {
                  setPreset("");
                  setDraft((d) => ({ ...d, interactive: e.target.checked }));
                }}
                className="size-5 accent-foreground"
              />
              <span className="font-mono text-data">interactive</span>
              <span className="text-data text-subtle">Light follows the pointer over the parent section</span>
            </label>
          </div>
        </div>
        <div className="col-span-4 flex flex-col gap-3 md:col-span-6">
          <CodeBlock className="flex-1">{snippet(draft)}</CodeBlock>
          <p className="px-1 text-data leading-relaxed text-muted-foreground">
            The parent needs <code className="font-mono">relative isolate overflow-hidden</code>. Colors come from{" "}
            <code className="font-mono">--grain-lo</code> and <code className="font-mono">--grain-hi</code>, so the field follows the theme. Use one shader
            moment per viewport.
          </p>
        </div>
      </div>
    </div>
  );
}
