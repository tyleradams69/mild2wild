import { describe, expect, it } from "vitest";
import { dogClickerTreats, getDogClickerMascot } from "../src/lib/dog-clicker";

describe("dog treat clicker", () => {
  it("uses the shop dog mascot image and defines feedable treat milestones", () => {
    const mascot = getDogClickerMascot();

    expect(mascot.name).toBe("Schwebels");
    expect(mascot.tagline).toContain("Schwebels");
    expect(mascot.image).toBe("/staff/team-member-12.jpg");
    expect(mascot.route).toBe("/dog-clicker");
    expect(dogClickerTreats.map((treat) => treat.name)).toEqual([
      "Tiny Biscuit",
      "Rainbow Bone",
      "Spa Day Snack",
      "Wild Deluxe Treat",
    ]);
    expect(dogClickerTreats.every((treat, index, treats) => index === 0 || treat.unlockAt > treats[index - 1].unlockAt)).toBe(true);
  });
});
