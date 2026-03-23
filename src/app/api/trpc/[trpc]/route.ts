import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError: ({ path, error, input }) => {
      if (env.NODE_ENV === "development") {
        console.error(
          `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
        );
      }

      if (error.code === "TOO_MANY_REQUESTS" || error.message.includes("quota")) {
        console.warn(`🚨 LIMITE ATINGIDO: Alguém pesou a mão na API em ${path}`);
      }
      if (env.NODE_ENV === "production" && error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`CRITICAL_FAILURE [${path}]:`, error.cause ?? error.message);
      }
    },
  });

export { handler as GET, handler as POST };