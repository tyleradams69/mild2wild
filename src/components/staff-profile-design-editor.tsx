"use client";

import { useMemo, useState } from "react";
import { staffProfileColorSlots, staffProfileDecorTemplates, staffProfileTemplates } from "@/lib/staff-profile-themes";
import type { StaffProfileColorSlot, StaffProfileDecorId, StaffProfileTemplateId, StaffProfileTheme } from "@/lib/studio-data";

type StaffProfileDesignEditorProps = {
  initialTheme?: StaffProfileTheme;
  defaultTemplate: StaffProfileTemplateId;
  defaultDecor: StaffProfileDecorId;
};

const templateMap = new Map(staffProfileTemplates.map((template) => [template.id, template]));
const decorMap = new Map(staffProfileDecorTemplates.map((template) => [template.id, template]));

export function StaffProfileDesignEditor({ initialTheme, defaultTemplate, defaultDecor }: StaffProfileDesignEditorProps) {
  const startingTemplate = initialTheme?.template ?? defaultTemplate;
  const startingPalette = templateMap.get(startingTemplate)?.palette ?? templateMap.get(defaultTemplate)?.palette ?? staffProfileTemplates[0].palette;
  const [template, setTemplate] = useState<StaffProfileTemplateId>(startingTemplate);
  const [decor, setDecor] = useState<StaffProfileDecorId>(initialTheme?.decor ?? defaultDecor);
  const [colors, setColors] = useState<Record<StaffProfileColorSlot, string>>(() => {
    return Object.fromEntries(staffProfileColorSlots.map(({ key }) => [key, initialTheme?.colors?.[key] ?? startingPalette[key]])) as Record<StaffProfileColorSlot, string>;
  });

  const activeTemplate = useMemo(() => templateMap.get(template) ?? staffProfileTemplates[0], [template]);
  const activeDecor = useMemo(() => decorMap.get(decor) ?? staffProfileDecorTemplates[0], [decor]);

  function chooseTemplate(nextTemplate: StaffProfileTemplateId) {
    setTemplate(nextTemplate);
    const nextPalette = templateMap.get(nextTemplate)?.palette ?? activeTemplate.palette;
    setColors(Object.fromEntries(staffProfileColorSlots.map(({ key }) => [key, nextPalette[key]])) as Record<StaffProfileColorSlot, string>);
  }

  function updateColor(key: StaffProfileColorSlot, value: string) {
    setColors((current) => ({ ...current, [key]: value.toUpperCase() }));
  }

  function resetToTemplate() {
    setColors(Object.fromEntries(staffProfileColorSlots.map(({ key }) => [key, activeTemplate.palette[key]])) as Record<StaffProfileColorSlot, string>);
  }

  return (
    <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Profile design</p>
          <h2 className="brand-display mt-1 text-2xl font-black uppercase text-white">Template + colors</h2>
        </div>
        <p className="max-w-md text-xs font-bold leading-5 text-white/45">
          Pick a guarded layout-safe template, then tune the profile colors. The page structure stays locked so profiles stay readable and on-brand.
        </p>
      </div>

      <input type="hidden" name="profileThemeTemplate" value={template} />
      <input type="hidden" name="profileThemeDecor" value={decor} />
      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Design template</span>
        <select
          value={template}
          onChange={(event) => chooseTemplate(event.target.value as StaffProfileTemplateId)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none focus:border-white/40"
        >
          {staffProfileTemplates.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs font-bold leading-5 text-white/48">{activeTemplate.description}</p>

      <label className="mt-4 block">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Bio panel artwork</span>
        <select
          value={decor}
          onChange={(event) => setDecor(event.target.value as StaffProfileDecorId)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-white outline-none focus:border-white/40"
        >
          {staffProfileDecorTemplates.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <p className="mt-2 rounded-2xl border border-white/10 bg-black/30 p-3 text-xs font-bold leading-5 text-white/48">{activeDecor.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={resetToTemplate} className="rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/70 transition hover:bg-white hover:text-black">
          Reset colors to template
        </button>
        <div className="flex min-h-10 overflow-hidden rounded-full border border-white/10">
          {staffProfileColorSlots.map(({ key }) => (
            <span key={key} className="h-10 w-8" style={{ background: colors[key] }} title={key} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {staffProfileColorSlots.map(({ key, label, description }) => (
          <label key={key} className="rounded-3xl border border-white/10 bg-black/35 p-3">
            <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/45">{label}</span>
            <span className="mt-1 block min-h-8 text-xs font-bold leading-4 text-white/35">{description}</span>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="color"
                value={colors[key]}
                onChange={(event) => updateColor(key, event.target.value)}
                className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-white/10 bg-black/60 p-1"
                aria-label={`${label} color`}
              />
              <input
                name={`profileThemeColor-${key}`}
                value={colors[key]}
                onChange={(event) => updateColor(key, event.target.value)}
                pattern="#[0-9A-Fa-f]{6}"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/70 px-3 py-2 text-sm font-black uppercase tracking-[0.08em] text-white outline-none focus:border-white/40"
              />
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
