cd ~/dev/tanium-gateway-mcp
cat > test-connection.mjs << 'EOF'
try {
  const res = await fetch("https://10.10.10.41/plugin/products/gateway/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", session: process.env.TANIUM_API_TOKEN },
    body: JSON.stringify({ query: "{ __typename }" }),
  });
  console.log("status:", res.status);
  console.log(await res.text());
} catch (err) {
  console.error("에러 메시지:", err.message);
  console.error("실제 원인(cause):", err.cause);
}
EOF

export $(grep -v '^#' .env | xargs)
node test-connection.mjs