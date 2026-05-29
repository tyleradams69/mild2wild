import type { DogTreatIconName } from "@/lib/dog-clicker";

type DogTreatIconProps = {
  icon: DogTreatIconName;
  className?: string;
};

export function DogTreatIcon({ icon, className = "" }: DogTreatIconProps) {
  const shared = `h-12 w-12 ${className}`;

  if (icon === "rainbow") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" className={shared} fill="none">
        <path d="M12 42a20 20 0 0 1 40 0" stroke="#17130f" strokeWidth="10" strokeLinecap="round" />
        <path d="M12 42a20 20 0 0 1 40 0" stroke="#ff8bc8" strokeWidth="6" strokeLinecap="round" />
        <path d="M19 42a13 13 0 0 1 26 0" stroke="#ffe26f" strokeWidth="6" strokeLinecap="round" />
        <path d="M26 42a6 6 0 0 1 12 0" stroke="#79dfff" strokeWidth="6" strokeLinecap="round" />
        <path d="M10 47h44" stroke="#17130f" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" className={shared} fill="none">
        <path d="M33 8l6 17 17 6-17 6-6 17-6-17-17-6 17-6 6-17Z" fill="#ffe26f" stroke="#17130f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M14 10l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#ffcae6" stroke="#17130f" strokeWidth="3" strokeLinejoin="round" />
        <path d="M49 42l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" fill="#caff9b" stroke="#17130f" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "crown") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true" className={shared} fill="none">
        <path d="M10 23l12 12 10-20 10 20 12-12-5 27H15L10 23Z" fill="#ffe26f" stroke="#17130f" strokeWidth="4" strokeLinejoin="round" />
        <path d="M17 50h30" stroke="#17130f" strokeWidth="5" strokeLinecap="round" />
        <circle cx="22" cy="35" r="3" fill="#ff8bc8" stroke="#17130f" strokeWidth="2" />
        <circle cx="32" cy="30" r="3" fill="#79dfff" stroke="#17130f" strokeWidth="2" />
        <circle cx="42" cy="35" r="3" fill="#95df68" stroke="#17130f" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={shared} fill="none">
      <path d="M21 21c-3-3-8-3-11 0s-3 8 0 11l22 22c3 3 8 3 11 0s3-8 0-11L21 21Z" fill="#fff7e8" stroke="#17130f" strokeWidth="5" strokeLinejoin="round" />
      <path d="M43 21c3-3 8-3 11 0s3 8 0 11L32 54 10 32c-3-3-3-8 0-11s8-3 11 0l11 11 11-11Z" fill="#fff7e8" stroke="#17130f" strokeWidth="5" strokeLinejoin="round" />
      <path d="M24 36l16-16" stroke="#ff8bc8" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 42l16-16" stroke="#79dfff" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
