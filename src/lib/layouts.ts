export type LayoutId = "larpz" | "halo" | "pulse";

export const LAYOUTS: { id: LayoutId; name: string; blurb: string }[] = [
  {
    id: "larpz",
    name: "Larpz list",
    blurb: "Black cards, Home / Trade / Explore, Cash row, search + plus button.",
  },
  {
    id: "halo",
    name: "Halo ring",
    blurb: "Purple glass cards and a circular allocation ring around the total.",
  },
  {
    id: "pulse",
    name: "Pulse markets",
    blurb: "Gradient header, Transfer / Swap / Buy, market chips, Assets toggle.",
  },
];
