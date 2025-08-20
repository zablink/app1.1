// /types/next-auth-jwt.d.ts
import type { JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface GetTokenParams {
    req: any;
    secret?: string;
    raw?: boolean;
  }

  export function getToken(params: GetTokenParams): Promise<JWT | null>;
}
