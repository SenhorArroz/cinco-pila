import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const operacoesRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ title: z.string().min(1), description: z.string().min(1), value: z.number(), type: z.enum(["INCOME", "EXPENSE"]) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.transaction.create({
                data: {
                    title: input.title,
                    description: input.description,
                    value: input.value,
                    type: input.type,
                    user: { connect: { id: ctx.session.user.id } },
                },
            });
        }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });

        return post ?? null;
    }),

    update: protectedProcedure
        .input(z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string().min(1), value: z.number(), type: z.enum(["INCOME", "EXPENSE"]) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.transaction.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    value: input.value,
                    type: input.type,
                },
            });
        }),
    delete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.transaction.delete({
                where: { id: input.id },
            });
        }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findFirst({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });

        return post ?? null;
    }),
    getDaily: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id }, createdAt: { gte: new Date() } },
        });

        return post ?? null;
    }),
    saldoAtual: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            where: { user: { id: ctx.session.user.id } },
        });
        const saldoAtual = post?.reduce((acc, op) => acc + op.value, 0) || 0;
        return saldoAtual;
    }),
});