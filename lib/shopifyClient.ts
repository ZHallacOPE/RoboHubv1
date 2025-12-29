type GraphQLResponse = {
  data?: any;
  errors?: Array<{ message: string }>;
  error?: string;
};

export async function shopifyGql<T = any>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const res = await fetch("/api/shopify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as GraphQLResponse;

  if (!res.ok) throw new Error(json.error || "Shopify proxy error");
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(" | "));
  return json.data as T;
}
