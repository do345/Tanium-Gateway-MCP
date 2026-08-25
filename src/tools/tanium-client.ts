import "dotenv/config";
import { GraphQLClient } from "graphql-request";

// 개발/테스트 환경에서 자체서명 인증서로 인한 "fetch failed"를 우회해야 하는 경우에만 사용.
// 운영 환경에서는 반드시 NODE_EXTRA_CA_CERTS로 정식 CA 인증서를 등록하세요.
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  console.error(
    "⚠️  경고: TLS 인증서 검증이 비활성화되어 있습니다 (NODE_TLS_REJECT_UNAUTHORIZED=0). 개발/테스트 용도로만 사용하세요."
  );
}

const BASE_URL = process.env.TANIUM_BASE_URL;
const GRAPHQL_PATH = process.env.TANIUM_GRAPHQL_PATH ?? "/plugin/products/gateway/graphql";
const TOKEN = process.env.TANIUM_API_TOKEN;

if (!BASE_URL || !TOKEN) {
  throw new Error(
    "TANIUM_BASE_URL / TANIUM_API_TOKEN 환경변수가 설정되지 않았습니다. .env 파일을 확인하세요."
  );
}

const endpoint = new URL(GRAPHQL_PATH, BASE_URL).toString();

export const taniumClient = new GraphQLClient(endpoint, {
  headers: {
    // Tanium Gateway는 API 토큰을 session 헤더로 전달합니다.
    session: TOKEN,
  },
});

export async function gqlRequest<T = any>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await taniumClient.request<T>(query, variables);
  } catch (err: any) {
    const message =
      err?.response?.errors?.map((e: any) => e.message).join("; ") ??
      err.message ??
      String(err);
    throw new Error(`Tanium Gateway GraphQL 오류: ${message}`);
  }
}
