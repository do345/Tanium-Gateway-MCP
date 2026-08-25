import "dotenv/config";
import { GraphQLClient, ClientError } from "graphql-request";

if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0") {
  console.error(
    "⚠️ 경고: TLS 인증서 검증이 비활성화되어 있습니다. 개발/테스트 용도로만 사용하세요."
  );
}

const BASE_URL = process.env.TANIUM_BASE_URL;
const GRAPHQL_PATH =
  process.env.TANIUM_GRAPHQL_PATH ?? "/plugin/products/gateway/graphql";
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
    // 사내 버전에 따라 헤더명이 다를 수 있으니 401 발생 시 조정하세요.
    session: TOKEN,
  },
});

function formatError(err: unknown): string {
  if (err instanceof ClientError) {
    return (
      err.response.errors?.map((e) => e.message).join("; ") ?? err.message
    );
  }
  if (err instanceof Error) {
    const cause =
      err.cause instanceof Error
        ? `${err.cause.message}`
        : err.cause
          ? String(err.cause)
          : undefined;
    return cause ? `${err.message} (${cause})` : err.message;
  }
  return String(err);
}

export async function gqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await taniumClient.request<T>(query, variables);
  } catch (err: unknown) {
    throw new Error(`Tanium Gateway GraphQL 오류 [${endpoint}]: ${formatError(err)}`);
  }
}
