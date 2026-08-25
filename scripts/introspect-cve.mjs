import "dotenv/config";
import { GraphQLClient } from "graphql-request";
import { writeFileSync } from "node:fs";

const endpoint = new URL(
  process.env.TANIUM_GRAPHQL_PATH,
  process.env.TANIUM_BASE_URL
).toString();
const client = new GraphQLClient(endpoint, {
  headers: { session: process.env.TANIUM_API_TOKEN },
});

const data = await client.request(`{
  endpointsField: __type(name: "Query") {
    fields {
      name
      args {
        name
        type { kind name ofType { kind name ofType { kind name ofType { kind name } } } }
      }
    }
  }
  Endpoint: __type(name: "Endpoint") {
    fields { name type { kind name ofType { kind name } } }
  }
  EndpointCompliance: __type(name: "EndpointCompliance") {
    fields {
      name
      args { name type { kind name ofType { kind name ofType { kind name } } } }
      type { kind name ofType { kind name ofType { kind name } } }
    }
  }
  Cve: __type(name: "EndpointComplianceCveFinding") {
    fields { name type { kind name ofType { kind name ofType { kind name } } } }
  }
  Conn: __type(name: "EndpointConnection") {
    fields { name type { kind name ofType { kind name } } }
  }
  PageInfo: __type(name: "PageInfo") { fields { name } }
  FilterField: __type(name: "FilterField") { enumValues { name } }
  EndpointFilterField: __type(name: "EndpointFilterField") { enumValues { name } }
}`);

const endpoints = data.endpointsField.fields.find((f) => f.name === "endpoints");
const out = {
  endpointsArgs: endpoints?.args ?? null,
  endpointFields: data.Endpoint?.fields ?? null,
  compliance: data.EndpointCompliance?.fields ?? null,
  cveFields: data.Cve?.fields ?? null,
  connFields: data.Conn?.fields ?? null,
  pageInfo: data.PageInfo?.fields ?? null,
  filterFieldCve: (data.FilterField?.enumValues ?? [])
    .map((v) => v.name)
    .filter((n) => /CVE|COMPLIANCE|SEVERITY|FINDING/i.test(n)),
  endpointFilterFieldCve: (data.EndpointFilterField?.enumValues ?? [])
    .map((v) => v.name)
    .filter((n) => /CVE|COMPLIANCE|SEVERITY|FINDING/i.test(n)),
};

writeFileSync("schema-cve.json", JSON.stringify(out, null, 2));
console.log("wrote schema-cve.json");
