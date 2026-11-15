/** An action title without its trailing full stop (stripped at render; the data keeps its text). */
export const plainTitle = (title: string) =>
  title
    .replace(/\.+\s*$/, "")
    // Omaolo is named with what it is at its first use, which is the title of its own action.
    .replace("the national digital symptom assessment (Omaolo)", "Omaolo (the national online symptom checker)");
