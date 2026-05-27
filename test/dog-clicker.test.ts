import { describe, expect, it } from "vitest";
import { dogClickerTreats, getDogClickerMascot } from "../src/lib/dog-clicker";

describe("dog treat clicker", () => {
  it("uses the shop dog mascot image and defines feedable treat milestones", () => {
    const mascot = getDogClickerMascot();

    expect(mascot.name).toBe("Shop Dog Mascot");
    expect(mascot.image).toBe("/staff/team-member-12.jpg");
    expect(mascot.route).toBe("/dog-clicker");
    expect(dogClickerTreats.map((treat) => treat.name)).toEqual([
      "Tiny Biscuit",
      "Rainbow Bone",
      "Spa Day Snack",
      "Wild Deluxe Treat",
    ]);
    expect(dogClickerTreats.map((treat) => treat.treatShape)).toEqual(["biscuit", "bone", "sparkle", "crown"]);
    expect(dogClickerTreats.map((treat) => treat.treatColor)).toEqual(["#f7c66d", "#87dcff", "#ff9bd4", "#c9ff8f"]);
    expect(dogClickerTreats.every((treat, index, treats) => index === 0 || treat.unlockAt > treats[index - 1].unlockAt)).toBe(true);
  });
});
