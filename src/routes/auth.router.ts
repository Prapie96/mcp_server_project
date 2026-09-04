import { Request, Response, Router } from "express";

const router = Router();

router.get(
  "/.well-known/oauth-protected-resource",
  (req: Request, res: Response) => {
    res.status(200).json({
      resource: "https://resource.example.com", //domain's mcp server
      authorization_servers: [
        "https://as1.example.com", // Autherization server
        "https://as2.example.net",
      ],
      bearer_methods_supported: ["header"],
      scopes_supported: ["mcp:tools","mcp:resource"],

    });
  },
);

export default router;
