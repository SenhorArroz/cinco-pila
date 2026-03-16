import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const transactionTagRouter = createTRPCRouter({
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transactionTag.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });

        return post ?? null;
    }),
    create: protectedProcedure.input(z.object({ name: z.string(), color: z.string() })).mutation(async ({ ctx, input }) => {
        const post = await ctx.db.transactionTag.create({
            data: {
                name: input.name,
                color: input.color,
                user: { connect: { id: ctx.session.user.id } },
            },
        });

        return post ?? null;
    }),
    delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
        const post = await ctx.db.transactionTag.delete({
            where: { id: input.id },
        });

        return post ?? null;
    }),
    update: protectedProcedure.input(z.object({ id: z.string(), name: z.string(), color: z.string() })).mutation(async ({ ctx, input }) => {
        const post = await ctx.db.transactionTag.update({
            where: { id: input.id },
            data: {
                color: input.color,
                name: input.name,
            },
        });

        return post ?? null;
    }),
});