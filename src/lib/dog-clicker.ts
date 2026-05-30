export type DogTreatIconName = "bone" | "rainbow" | "spark" | "crown";

export type DogClickerTreat = {
  name: string;
  icon: DogTreatIconName;
  unlockAt: number;
  rewardText: string;
};

export const dogClickerTreats: DogClickerTreat[] = [
  {
    name: "Tiny Biscuit",
    icon: "bone",
    unlockAt: 0,
    rewardText: "A polite little crunch.",
  },
  {
    name: "Rainbow Bone",
    icon: "rainbow",
    unlockAt: 25,
    rewardText: "Tail wag mode: activated.",
  },
  {
    name: "Spa Day Snack",
    icon: "spark",
    unlockAt: 75,
    rewardText: "Schwebels is feeling pampered.",
  },
  {
    name: "Wild Deluxe Treat",
    icon: "crown",
    unlockAt: 150,
    rewardText: "Schwebels now owns the parlor.",
  },
];

export function getDogClickerMascot() {
  return {
    name: "Schwebels",
    title: "Shop Dog Treat Clicker Mascot",
    image: "/staff/team-member-12.jpg",
    route: "/dog-clicker",
    tagline: "Tap Schwebels. Feed treats. Unlock maximum tail-wag energy.",
  };
}

export function getUnlockedTreat(totalTreats: number) {
  return dogClickerTreats.reduce((current, treat) => (totalTreats >= treat.unlockAt ? treat : current), dogClickerTreats[0]);
}
