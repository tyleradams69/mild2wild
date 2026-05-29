import Link from "next/link";
import { DogClickerGame } from "@/components/dog-clicker-game";
import { DogTreatIcon } from "@/components/dog-treat-icon";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dogClickerTreats } from "@/lib/dog-clicker";

const treatCardAccents = ["#ffcae6", "#c7f2ff", "#fff1a8", "#d5c4ff"];

export default function DogClickerPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <DogClickerGame />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <SectionEyebrow color="#caff9b">Treat unlocks</SectionEyebrow>
        <div className="grid gap-5 md:grid-cols-4">
          {dogClickerTreats.map((treat, index) => (
            <article key={treat.name} className="relative overflow-hidden rounded-[2rem] border-[4px] border-black bg-[#fff7e8] p-4 shadow-[8px_10px_0_#17130f] md:p-5">
              <div className="absolute inset-0 opacity-70" style={{ background: `radial-gradient(circle at 18% 12%, ${treatCardAccents[index]} 0 18%, transparent 19%), radial-gradient(circle at 92% 88%, #caff9b 0 16%, transparent 17%)` }} aria-hidden="true" />
              <div className="relative z-10 min-h-full rounded-[1.45rem] border-2 border-dashed border-black/18 bg-white/55 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-[3px] border-black shadow-[4px_5px_0_#17130f]" style={{ background: treatCardAccents[index] }}>
                    <DogTreatIcon icon={treat.icon} className="h-11 w-11" />
                  </span>
                  <span className="rounded-full border-2 border-black bg-[#fffaf0] px-3 py-2 text-[0.6rem] font-black uppercase tracking-[0.18em] text-black/60 shadow-[3px_4px_0_#17130f]">
                    Level {index + 1}
                  </span>
                </div>
                <h2 className="brand-display mt-6 text-3xl uppercase leading-none text-black">{treat.name}</h2>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-black/55">Unlocks at {treat.unlockAt} treats</p>
                <p className="mt-4 leading-7 text-black/65">{treat.rewardText}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 flex justify-center px-1 pb-6 text-center">
          <Link href="/book" className="inline-flex w-full max-w-[22rem] flex-col items-center justify-center rounded-full border-[3px] border-black bg-pink-300 px-5 py-4 text-xs font-black uppercase leading-5 tracking-[0.13em] text-black shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-200 sm:w-auto sm:max-w-none sm:flex-row sm:px-7 sm:text-sm sm:tracking-[0.18em]">
            <span>Done feeding?</span>
            <span className="sm:ml-2">Book the humans</span>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
