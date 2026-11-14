// Set when "Start the briefing" is pressed, read once by the shell when it first mounts, so the
// step that the press brings on screen takes the keyboard focus like every later step. A page
// that is loaded directly (a refresh, an emailed link) starts with it unset and keeps the
// browser's own focus.
let arriving = false;

export function markArrival(): void {
  arriving = true;
}

export function takeArrival(): boolean {
  const was = arriving;
  arriving = false;
  return was;
}
