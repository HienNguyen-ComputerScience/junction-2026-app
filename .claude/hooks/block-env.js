// Blocks the agent from editing .env files (except .env.example).
let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let filePath = "";
  try {
    filePath = (JSON.parse(input).tool_input || {}).file_path || "";
  } catch {
    process.exit(0);
  }
  const name = filePath.split(/[\/]/).pop() || "";
  if (name.startsWith(".env") && name !== ".env.example") {
    console.error("Blocked: do not edit .env files. Tell your human which variable to add.");
    process.exit(2);
  }
  process.exit(0);
});
