import type { NextRequest } from "next/server";

import { buildDocx, DOCX_TYPE } from "@/lib/export/docx";
import { buildXlsx, XLSX_TYPE } from "@/lib/export/xlsx";
import { planFileName, planToDocx, planToSheets } from "@/lib/plan-export";
import { buildPlan } from "@/lib/plan-model";

function file(body: Uint8Array<ArrayBuffer>, type: string, name: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": type,
      "Content-Disposition": `attachment; filename="${name}"`,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "no-store",
    },
  });
}

/**
 * The action plan as a file: ?format=docx (Word) or ?format=xlsx (Excel), with the same query
 * parameters as the plan page (docs/audit/contract.md), so the file carries what was typed.
 * The proxy does not cover this path, so the area id is checked here.
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/county/[id]/plan/export">) {
  const { id } = await ctx.params;
  const params = request.nextUrl.searchParams;
  const plan = buildPlan(id, params);
  if (!plan) return new Response("Unknown area.", { status: 404 });

  const format = params.get("format");
  if (format === "docx") return file(buildDocx(planToDocx(plan)), DOCX_TYPE, planFileName(plan, "docx"));
  if (format === "xlsx") return file(buildXlsx(planToSheets(plan)), XLSX_TYPE, planFileName(plan, "xlsx"));
  return new Response("Unknown format. Use format=docx or format=xlsx.", { status: 400 });
}
