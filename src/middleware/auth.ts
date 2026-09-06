import "dotenv/config";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
// import { Scalekit } from "@scalekit-sdk/node";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

export type TenantIdType = "seven_elven" | "cj_more" | "lotus";

interface PayloadUser {
  userId: string;
  tenantId: TenantIdType;
  name: string;
  role: "Admin" | "Employee";
  scope: String[];
}

declare global {
  namespace Express {
    interface Request {
      user: PayloadUser;
    }
  }
}

// const scalekit = new Scalekit(
//   process.env.SCALEKIT_ENVIRONMENT_URL!,
//   process.env.SCALEKIT_CLIENT_ID!,
//   process.env.SCALEKIT_CLIENT_SECRET!,
// );
// Your MCP server's Resource ID
const RESOURCE_ID = "http://localhost:8000/mcp";

// Metadata url required by clients for discovery
const METADATA_URL =
  "http://localhost:8000/.well-known/oauth-protected-resource/";
const WWWHeader = {
  key: "WWW-Authenticate",
  value: `Bearer realm="OAuth", resource_metadata="${METADATA_URL}"`,
};
const KEYCLOAK_ISSUER = "http://localhost:8080/realms/mcp_demo";
const JWKS = createRemoteJWKSet(
  new URL(`${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`),
);

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer")) {
      res.setHeader(
        "WWW-Authenticate",
        'Bearer resource_metadata="http://localhost:8000/.well-known/oauth-protected-resource"',
      );

      return res.status(401).json({
        error: "unauthorized",
        error_description: "Missing bearer token",
      });
    }

    const token = await authorization.substring("Bearer ".length);
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: KEYCLOAK_ISSUER,
    });
    console.log("Authenticated user:", payload);
    (req as any).user = payload;
    next();
  } catch (error) {
    console.error("JWT validation failed:", error);

    return res.status(401).json({
      error: "invalid_token",
      error_description: "Invalid access token",
    });
  }
};

// export async function authMiddleware(
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   try {
//     // Allow metadata discovery to stay public
//     if (req.path.includes(".well-known")) return next();

//     const token = req.headers.authorization?.replace("Bearer ", "").trim();
//     if (!token) throw new Error("Missing Bearer token");

//     const tokenData = await scalekit.validateToken(token, {
//       audience: [RESOURCE_ID],
//       // optionally verify for scopes requiredScopes: [customer:read, interaction:read]
//     });
//     console.log("Token = ", tokenData);
//     return next();
//   } catch {
//     return res.status(401).set(WWWHeader.key, WWWHeader.value).end();
//   }
// }

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const token = req.headers["authorization"]?.split(" ")[1];
//     if (!token) {
//       //  set WWW.Authenticate
//       res.setHeader(
//         "WWW.Authenticate",
//         `Bearer resource_metadata=${"http://localhost:8000/auth/.well-known/oauth-protected-resource"}`,
//       );
//       res.status(401).json("You don't have token");
//       return;
//     }

//     // if no token set to undefined
//     // if(!token){
//     //     req.user = undefined as any;
//     //     return next();
//     // }
//     const decode = jwt.verify(
//       token,
//       process.env.JWT_SECRET_KEY as string,
//     ) as PayloadUser;
//     if (!decode) {
//       res.status(401).json("You don't have token");
//       return;
//     }
//     req.user = decode;
//     next();
//   } catch (error: any) {
//     if (error.name === "TokenExpiredError") {
//       res.status(401).json("Your session is expired");
//       return;
//     }
//     res.status(401).json("Internal Server Error");
//   }
// };
