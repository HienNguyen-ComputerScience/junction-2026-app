// Wording for the compare page's figures. No data imports, so client components can use it.

/** "30.7 points above Finland", "22.0 points below Finland", "Level with Finland". */
export function vsFinlandText(points: number): string {
  if (Math.abs(points) < 0.05) return "Level with Finland";
  return `${Math.abs(points).toFixed(1)} points ${points > 0 ? "above" : "below"} Finland`;
}

/** "27.4 points worse", "1.2 points better", "About the same"; null when the first year is missing. */
export function changeText(points: number | null): string | null {
  if (points === null) return null;
  if (Math.abs(points) < 1) return "About the same";
  return `${Math.abs(points).toFixed(1)} points ${points > 0 ? "worse" : "better"}`;
}
