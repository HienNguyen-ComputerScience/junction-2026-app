import { XLSX_TYPE } from "@/lib/export/xlsx";
import { buildStarterXlsx, STARTER_FILENAME } from "@/lib/insights/starter-xlsx";

/**
 * The starter dataset as an Excel template: aggregate counts only, no patient data. Built from
 * committed data only, so it is the same file for everyone.
 */
export function GET() {
  return new Response(buildStarterXlsx(), {
    headers: {
      "Content-Type": XLSX_TYPE,
      "Content-Disposition": `attachment; filename="${STARTER_FILENAME}"`,
    },
  });
}
