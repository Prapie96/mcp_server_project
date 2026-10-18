// import { checkResourceAllowed } from "@modelcontextprotocol/server";
// import { CONFIG } from "../config/config.js";
// import { mcpServerUrl, oauthMetadata } from "../index.js";

// export const tokenVerifier = {
//   verifyAccessToken: async (token: string) => {
//     const endpoint = oauthMetadata.introspection_endpoint;

//     if (!endpoint) {
//       console.error("[auth] no introspection endpoint in metadata");
//       throw new Error("No token verification endpoint available in metadata");
//     }

//     const params = new URLSearchParams({
//       token: token,
//       client_id: CONFIG.auth.clientId,
//     });

//     if (CONFIG.auth.clientSecret) {
//       params.set("client_secret", CONFIG.auth.clientSecret);
//     }

//     let response: Response;
//     try {
//       response = await fetch(endpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: params.toString(),
//       });
//     } catch (e) {
//       console.error("[auth] introspection fetch threw", e);
//       throw e;
//     }

//     if (!response.ok) {
//       const txt = await response.text();
//       console.error("[auth] introspection non-OK", { status: response.status });

//       try {
//         const obj = JSON.parse(txt);
//         console.log(JSON.stringify(obj, null, 2));
//       } catch {
//         console.error(txt);
//       }
//       throw new Error(`Invalid or expired token: ${txt}`);
//     }

//     let data: any;
//     try {
//       data = await response.json();
//     } catch (e) {
//       const txt = await response.text();
//       console.error("[auth] failed to parse introspection JSON", {
//         error: String(e),
//         body: txt,
//       });
//       throw e;
//     }

//     if (data.active === false) {
//       throw new Error("Inactive token");
//     }

//     if (!data.aud) {
//       throw new Error("Resource indicator (aud) missing");
//     }

//     const audiences: string[] = Array.isArray(data.aud) ? data.aud : [data.aud];
//     const allowed = audiences.some((a) => {
//       try {
//         return checkResourceAllowed({
//           requestedResource: a,
//           configuredResource: mcpServerUrl,
//         });
//       } catch {
//         // Keycloak tokens include non-URL audiences (e.g. "account", "test-client").
//         // Those are never our resource, so treat them as "no match" instead of crashing.
//         return false;
//       }
//     });
//     if (!allowed) {
//       throw new Error(
//         `None of the provided audiences are allowed. Expected ${mcpServerUrl}, got: ${audiences.join(", ")}`,
//       );
//     }

//     return {
//       token,
//       clientId: data.client_id,
//       scopes: data.scope ? data.scope.split(" ") : [],
//       expiresAt: data.exp,
//     };
//   },
// };
