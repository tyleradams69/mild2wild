export type DogClickerTreat = {
  name: string;
  emoji: string;
  unlockAt: number;
  rewardText: string;
  treatColor: string;
  treatShape: "biscuit" | "bone" | "sparkle" | "crown";
};

export const dogClickerTreats: DogClickerTreat[] = [
  {
    name: "Tiny Biscuit",
    emoji: "🦴",
    unlockAt: 0,
    rewardText: "A polite little crunch.",
    treatColor: "#f7c66d",
    treatShape: "biscuit",
  },
  {
    name: "Rainbow Bone",
    emoji: "🌈",
    unlockAt: 25,
    rewardText: "Tail wag mode: activated.",
    treatColor: "#87dcff",
    treatShape: "bone",
  },
  {
    name: "Spa Day Snack",
    emoji: "✨",
    unlockAt: 75,
    rewardText: "Mascot is feeling pampered.",
    treatColor: "#ff9bd4",
    treatShape: "sparkle",
  },
  {
    name: "Wild Deluxe Treat",
    emoji: "👑",
    unlockAt: 150,
    rewardText: "The shop dog now owns the parlor.",
    treatColor: "#c9ff8f",
    treatShape: "crown",
  },
];

export function getDogClickerMascot() {
  return {
    name: "Shop Dog Mascot",
    title: "Treat Clicker Mascot",
    image: "/staff/team-member-12.jpg",
    route: "/dog-clicker",
    tagline: "Tap the shop dog. Feed treats. Unlock maximum tail-wag energy.",
  };
}

export function getUnlockedTreat(totalTreats: number) {
  return dogClickerTreats.reduce((current, treat) => (totalTreats >= treat.unlockAt ? treat : current), dogClickerTreats[0]);
}
