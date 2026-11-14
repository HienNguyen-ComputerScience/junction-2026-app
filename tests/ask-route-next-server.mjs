// Minimal stand-in for "next/server" in node tests: only what the ask route and rate limiter use.
export class NextResponse extends Response {
  static json(body, init) {
    return Response.json(body, init);
  }
}
