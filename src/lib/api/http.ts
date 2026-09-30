import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (status >= 500) console.error("[api]", error);
  return NextResponse.json({ error: message }, { status });
}

/** Parses and validates a JSON body; throws a readable error on invalid input. */
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new Error("Request body must be valid JSON");
  }
  const result = schema.safeParse(json);
  if (!result.success) throw new Error(result.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "));
  return result.data;
}

/** Wraps a handler so validation/business errors become 400s instead of crashes. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response> | Response) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (err) {
      return fail(err, 400);
    }
  };
}
