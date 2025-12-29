import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  query: string;
  variables?: Record<string, any>;
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const { query, variables } = (await req.json()) as Body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing GraphQL query" }, { status: 400 });
    }

    const domain = requiredEnv("SHOPIFY_DOMAIN");
    const token = requiredEnv("SHOPIFY_STOREFRONT_TOKEN");
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-10";

    const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables: variables ?? {} }),
      cache: "no-store",
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Shopify request failed", status: res.status, details: json },
        { status: 502 }
      );
    }

    return NextResponse.json(json);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
