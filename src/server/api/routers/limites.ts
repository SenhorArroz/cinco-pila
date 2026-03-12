import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const limitesRouter = createTRPCRouter({
    create: protectedProcedure
    .input(z.object({ title: z.string().min(1), limitAmount: z.number(), currentSpent: z.number() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.limit.create({
            data: {
                title: input.title,
                limitAmount: input.limitAmount,
                currentSpent: input.currentSpent,
                user: { connect: { id: ctx.session.user.id } },
            },
        });
    }),
    update: protectedProcedure
    .input(z.object({ id: z.string().min(1), title: z.string().min(1), limitAmount: z.number(), currentSpent: z.number() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.limit.update({
            where: { id: input.id },
            data: {
                title: input.title,
                limitAmount: input.limitAmount,
                currentSpent: input.currentSpent,
            },
        });
    }),
    delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.limit.delete({
            where: { id: input.id },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const limits = await ctx.db.limit.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });
        return limits;
    }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
        const limit = await ctx.db.limit.findFirst({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });
        return limit;
    }),
});