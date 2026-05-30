"use client";

import { useMemo, useState } from "react";
import type { PortfolioImage } from "@/lib/studio-data";

type PortfolioRow = PortfolioImage & { id: string; enabled: boolean };

type StaffPortfolioEditorProps = {
  initialImages: PortfolioImage[];
};

const blankRows = 3;

function newBlankRow(index: number): PortfolioRow {
  return {
    id: `new-${Date.now()}-${index}`,
    src: "",
    label: "",
    alt: "",
    enabled: true,
  };
}

export function StaffPortfolioEditor({ initialImages }: StaffPortfolioEditorProps) {
  const startingRows = useMemo<PortfolioRow[]>(() => {
    const rows = initialImages.map((image, index) => ({ ...image, id: `${image.src}-${index}`, enabled: true }));
    return rows.length > 0 ? rows : Array.from({ length: blankRows }, (_, index) => newBlankRow(index));
  }, [initialImages]);
  const [rows, setRows] = useState(startingRows);

  function updateRow(index: number, update: Partial<PortfolioRow>) {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...update } : row)));
  }

  function moveRow(index: number, direction: -1 | 1) {
    setRows((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      const row = next[index];
      const target = next[nextIndex];
      if (!row || !target) return current;
      next[index] = target;
      next[nextIndex] = row;
      return next;
    });
  }

  function removeRow(index: number) {
    setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
  }

  function addRow() {
    setRows((current) => [...current, newBlankRow(current.length)]);
  }

  return (
    <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Portfolio showcase</p>
          <h2 className="brand-display mt-1 text-2xl font-black uppercase text-white">Featured work</h2>
        </div>
        <p className="max-w-md text-xs font-bold leading-5 text-white/45">
          Staff can reorder, hide, remove, replace, or add portfolio images. Phone uploads can come from the camera roll/photo picker.
        </p>
      </div>

      <div className="mt-4 rounded-3xl border border-pink-200/20 bg-pink-200/10 p-4">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-pink-100">Add photos from phone</span>
          <input
            name="portfolioNewFiles"
            type="file"
            accept="image/*"
            multiple
            className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-pink-300 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-black"
          />
        </label>
        <p className="mt-2 text-xs font-bold leading-5 text-white/45">
          On a phone, this opens the photo picker/camera options. New uploads are added to the end of the portfolio after saving.
        </p>
      </div>

      <input type="hidden" name="portfolioSlotCount" value={rows.length} />
      <div className="mt-4 grid gap-4">
        {rows.map((image, index) => {
          const isExisting = Boolean(image.src);
          return (
            <div key={image.id} className="rounded-3xl border border-white/10 bg-black/35 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="flex flex-wrap gap-2 lg:w-40 lg:flex-col">
                  <label className="flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/70">
                    <input
                      name={`portfolioEnabled-${index}`}
                      type="checkbox"
                      checked={image.enabled}
                      onChange={(event) => updateRow(index, { enabled: event.target.checked })}
                      className="h-4 w-4 accent-pink-300"
                    />
                    Show
                  </label>
                  <button type="button" onClick={() => moveRow(index, -1)} disabled={index === 0} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/60 disabled:opacity-30">
                    Move up
                  </button>
                  <button type="button" onClick={() => moveRow(index, 1)} disabled={index === rows.length - 1} className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/60 disabled:opacity-30">
                    Move down
                  </button>
                  <button type="button" onClick={() => removeRow(index)} className="rounded-full border border-red-200/20 bg-red-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-100">
                    Remove
                  </button>
                </div>

                <div className="grid flex-1 gap-3">
                  <input type="hidden" name={`portfolioSrc-${index}`} value={image.src} />
                  <label>
                    <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/40">Replace / upload image</span>
                    <input
                      name={`portfolioFile-${index}`}
                      type="file"
                      accept="image/*"
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/85 file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:tracking-[0.12em] file:text-black"
                    />
                    {isExisting ? <span className="mt-1 block break-all text-xs font-bold text-white/35">Current: {image.src}</span> : null}
                  </label>
                  <div className="grid gap-3 md:grid-cols-[0.45fr_0.55fr]">
                    <label>
                      <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/40">Short label</span>
                      <input
                        name={`portfolioLabel-${index}`}
                        value={image.label}
                        onChange={(event) => updateRow(index, { label: event.target.value })}
                        placeholder="Chrome French set"
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60"
                      />
                    </label>
                    <label>
                      <span className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/40">Alt description</span>
                      <input
                        name={`portfolioAlt-${index}`}
                        value={image.alt}
                        onChange={(event) => updateRow(index, { alt: event.target.value })}
                        placeholder="Brief description for accessibility"
                        className="mt-1 w-full rounded-2xl border border-white/10 bg-black/70 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" onClick={addRow} className="mt-4 rounded-full border border-white/15 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/70 transition hover:bg-white hover:text-black">
        Add manual slot
      </button>
    </div>
  );
}
