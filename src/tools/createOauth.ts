import { CONFIG } from "../config/config.js";

export function createOAuthUrls() {
  const authBaseUrl = new URL(`http://${CONFIG.auth.host}:${CONFIG.auth.port}`);
  //   const authBaseUrl = new URL(
  //     `http://${CONFIG.auth.host}:${CONFIG.auth.port}/realms/${CONFIG.auth.realm}/`,
  //   );
  return {
    issuer: authBaseUrl.toString(),
    introspection_endpoint: new URL(
      "protocol/openid-connect/token/introspect",
      authBaseUrl,
    ).toString(),
    authorization_endpoint: new URL(
      "protocol/openid-connect/auth",
      authBaseUrl,
    ).toString(),
    token_endpoint: new URL(
      "protocol/openid-connect/token",
      authBaseUrl,
    ).toString(),
  };
}
