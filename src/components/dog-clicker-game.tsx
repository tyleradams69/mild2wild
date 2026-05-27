"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties } from "react";
import { dogClickerTreats, getDogClickerMascot, getUnlockedTreat, type DogClickerTreat } from "@/lib/dog-clicker";

type TreatProjectile = {
  id: number;
  treat: DogClickerTreat;
  startX: number;
  startY: number;
  rotate: number;
};

function TreatIcon({ treat, className = "" }: { treat: DogClickerTreat; className?: string }) {
  const common = "treat-icon border-[3px] border-black shadow-[3px_4px_0_#17130f]";

  if (treat.treatShape === "bone") {
    return (
      <span className={`${common} ${className} treat-bone`} style={{ background: treat.treatColor }}>
        <span />
      </span>
    );
  }

  if (treat.treatShape === "sparkle") {
    return (
      <span className={`${common} ${className} treat-sparkle`} style={{ background: treat.treatColor }}>
        ✦
      </span>
    );
  }

  if (treat.treatShape === "crown") {
    return (
      <span className={`${common} ${className} treat-crown`} style={{ background: treat.treatColor }}>
        ♛
      </span>
    );
  }

  return (
    <span className={`${common} ${className} treat-biscuit`} style={{ background: treat.treatColor }}>
      <span />
    </span>
  );
}

export function DogClickerGame() {
  const mascot = getDogClickerMascot();
  const [treats, setTreats] = useState(0);
  const [combo, setCombo] = useState(0);
  const [biteKey, setBiteKey] = useState(0);
  const [projectiles, setProjectiles] = useState<TreatProjectile[]>([]);
  const unlockedTreat = getUnlockedTreat(treats);
  const nextTreat = dogClickerTreats.find((treat) => treat.unlockAt > treats);
  const progress = nextTreat ? Math.min(100, Math.round((treats / nextTreat.unlockAt) * 100)) : 100;
  const floatingTreats = useMemo(() => Array.from({ length: 10 }, (_, index) => index), []);

  function feedDog() {
    const nextTotal = treats + 1;
    const treatForClick = getUnlockedTreat(nextTotal);
    const id = Date.now() + Math.random();

    setTreats(nextTotal);
    setCombo((current) => (current + 1) % 8);
    setBiteKey((current) => current + 1);
    setProjectiles((current) => [
      ...current.slice(-8),
      {
        id,
        treat: treatForClick,
        startX: 18 + ((nextTotal * 19) % 66),
        startY: 88 + ((nextTotal * 7) % 7),
        rotate: -28 + ((nextTotal * 17) % 56),
      },
    ]);

    window.setTimeout(() => {
      setProjectiles((current) => current.filter((projectile) => projectile.id !== id));
    }, 8200);
  }

  return (
    <div className="relative overflow-hidden rounded-[2.8rem] border-[4px] border-black bg-[#fff7e8] p-5 shadow-[10px_12px_0_#17130f] md:p-8">
      <div className="absolute inset-0 opacity-35" aria-hidden="true">
        {floatingTreats.map((item) => (
          <span
            key={item}
            className="absolute"
            style={{
              left: `${(item * 17 + 8) % 92}%`,
              top: `${(item * 23 + 10) % 88}%`,
              rotate: `${(item % 2 === 0 ? 1 : -1) * (8 + item * 2)}deg`,
            }}
          >
            <TreatIcon treat={dogClickerTreats[item % dogClickerTreats.length]} className="scale-75" />
          </span>
        ))}
      </div>

      <div className="relative z-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="marker-script inline-flex rotate-[-1deg] rounded-full border-[3px] border-black bg-pink-200 px-4 py-2 text-sm uppercase text-black shadow-[4px_5px_0_#17130f]">
            Shop dog treat lab
          </p>
          <h1 className="brand-display mt-5 text-6xl uppercase leading-none text-black md:text-8xl">
            Feed the Mascot
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-black/68 md:text-xl">{mascot.tagline}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border-[3px] border-black bg-cyan-200 p-4 text-center shadow-[5px_6px_0_#17130f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Treats</p>
              <p className="brand-display text-5xl text-black">{treats}</p>
            </div>
            <div className="rounded-3xl border-[3px] border-black bg-yellow-200 p-4 text-center shadow-[5px_6px_0_#17130f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Current</p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <TreatIcon treat={unlockedTreat} className="scale-75" />
                <p className="brand-display text-3xl text-black">{unlockedTreat.name}</p>
              </div>
            </div>
            <div className="rounded-3xl border-[3px] border-black bg-lime-200 p-4 text-center shadow-[5px_6px_0_#17130f]">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Combo</p>
              <p className="brand-display text-5xl text-black">x{combo + 1}</p>
            </div>
          </div>

          <div className="mt-7 rounded-3xl border-[3px] border-black bg-white p-4 shadow-[5px_6px_0_#17130f]">
            <div className="flex items-center justify-between gap-4 text-xs font-black uppercase tracking-[0.18em] text-black/60">
              <span>{unlockedTreat.rewardText}</span>
              <span>{nextTreat ? `${nextTreat.unlockAt - treats} to ${nextTreat.name}` : "All treats unlocked"}</span>
            </div>
            <div className="mt-3 h-5 overflow-hidden rounded-full border-[3px] border-black bg-[#f6f0e4]">
              <div className="h-full rounded-full bg-gradient-to-r from-pink-300 via-yellow-200 to-cyan-300 transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-6 top-8 z-30 rounded-full border-[3px] border-black bg-yellow-200 px-5 py-3 font-black uppercase tracking-[0.16em] text-black shadow-[5px_6px_0_#17130f]">
            {unlockedTreat.emoji} {unlockedTreat.name}
          </div>
          <button
            type="button"
            onClick={feedDog}
            className="group relative block w-full rounded-[3rem] border-[5px] border-black bg-pink-200 p-5 shadow-[12px_14px_0_#17130f] transition active:translate-x-1 active:translate-y-1 active:shadow-[7px_8px_0_#17130f]"
            aria-label={`Feed ${mascot.name} a treat`}
          >
            <span className="absolute right-5 top-5 z-30 rounded-full border-[3px] border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_5px_0_#17130f]">
              Tap to feed
            </span>
            <span className="absolute -bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-full border-[3px] border-black bg-cyan-200 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_6px_0_#17130f]">
              +1 {unlockedTreat.name.toLowerCase()}
            </span>
            <div className="relative aspect-square overflow-hidden rounded-[2.3rem] border-[4px] border-black bg-white">
              <div key={biteKey} className="dog-eat-stage absolute inset-0">
                <Image src={mascot.image} alt={mascot.name} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition duration-300 group-hover:scale-[1.03]" priority />
                {projectiles.length > 0 ? (
                  <>
                    <span className="dog-mouth-pop absolute left-[52%] top-[43%] z-30 h-10 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-[#ff8c57] shadow-[3px_4px_0_#17130f]" aria-hidden="true" />
                    <span className="dog-nom-bubble absolute left-[56%] top-[35%] z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-yellow-200 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[4px_5px_0_#17130f]" aria-hidden="true">NOM!</span>
                  </>
                ) : null}
              </div>
              {projectiles.map((projectile) => (
                <span
                  key={projectile.id}
                  className="treat-projectile absolute z-40"
                  style={
                    {
                      "--start-x": `${projectile.startX}%`,
                      "--start-y": `${projectile.startY}%`,
                      "--end-x": "52%",
                      "--end-y": "43%",
                      "--treat-rotate": `${projectile.rotate}deg`,
                    } as CSSProperties
                  }
                  aria-hidden="true"
                >
                  <TreatIcon treat={projectile.treat} className="scale-125" />
                </span>
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
