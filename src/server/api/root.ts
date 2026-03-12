import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { operacoesRouter } from "./routers/operacoes";
import { metasRouter } from "./routers/metas";
import { limitesRouter } from "./routers/limites";
import { faturaRouter } from "./routers/fatura";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  operacoes: operacoesRouter,
  metas: metasRouter,
  limites: limitesRouter,
  faturas: faturaRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/** 
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
