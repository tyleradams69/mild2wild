import Link from "next/link";
import { DogClickerGame } from "@/components/dog-clicker-game";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dogClickerTreats } from "@/lib/dog-clicker";

export default function DogClickerPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <DogClickerGame />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <SectionEyebrow color="#caff9b">Treat unlocks</SectionEyebrow>
        <div className="grid gap-5 md:grid-cols-4">
          {dogClickerTreats.map((treat) => (
            <article key={treat.name} className="neon-card rounded-[2rem] p-5">
              <p className="text-4xl">{treat.emoji}</p>
              <h2 className="brand-display mt-4 text-3xl uppercase text-black">{treat.name}</h2>
              <p className="mt-3 text-sm font-black uppercase tracking-[0.18em] text-black/55">Unlocks at {treat.unlockAt} treats</p>
              <p className="mt-4 leading-7 text-black/65">{treat.rewardText}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link href="/book" className="rounded-full border-[3px] border-black bg-pink-300 px-7 py-4 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-200">
            Done feeding? Book the humans
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
