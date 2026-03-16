import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const operacoesRouter = createTRPCRouter({
    getExpenses: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id }, type: "EXPENSE" },
        });

        return post ?? null;
    }),
    getIncomes: protectedProcedure.query(async({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id }, type: "INCOME" },
        });
        return post ?? null;
    }),



    create: protectedProcedure
        .input(z.object({ title: z.string().min(1), tagId: z.string().min(1).optional(), description: z.string().min(1), value: z.number(), type: z.enum(["INCOME", "EXPENSE"]) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.transaction.create({
                data: {
                    title: input.title,
                    description: input.description,
                    value: input.value,
                    tag: { connect: { id: input.tagId } },
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
        .input(z.object({ id: z.string().min(1), title: z.string().min(1), tagId: z.string().min(1).optional(), description: z.string().min(1), value: z.number(), type: z.enum(["INCOME", "EXPENSE"]) }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.transaction.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description,
                    value: input.value,
                    tag: { connect: { id: input.tagId } },
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
    getDailyExpenses: protectedProcedure.query(async ({ ctx }) => {
    // Cria uma data e reseta para meia-noite
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const post = await ctx.db.transaction.findMany({
        orderBy: { createdAt: "desc" },
        where: { 
            user: { id: ctx.session.user.id }, 
            type: "EXPENSE",
            createdAt: { gte: startOfDay } // Agora sim: tudo de hoje pra frente
        },
    });
    return post ?? null;
}),

getDailyIncomes: protectedProcedure.query(async ({ ctx }) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const post = await ctx.db.transaction.findMany({
        orderBy: { createdAt: "desc" },
        where: { 
            user: { id: ctx.session.user.id }, 
            type: "INCOME",
            createdAt: { gte: startOfDay } 
        },
    });
    return post ?? null;
}),
    getAllExpenses: protectedProcedure.query(async ({ ctx }) => {
        const post = await ctx.db.transaction.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id }, type: "EXPENSE" },
        });
        return post ?? null;
    }),
    saldoAtual: protectedProcedure.query(async ({ ctx }) => {
        const incomes = await ctx.db.transaction.findMany({
            where: { user: { id: ctx.session.user.id }, type: "INCOME" },
        });
        const expenses = await ctx.db.transaction.findMany({
            where: { user: { id: ctx.session.user.id }, type: "EXPENSE" },
        });

        const saldoAtual = incomes?.reduce((acc, op) => acc + op.value, 0) - expenses?.reduce((acc, op) => acc + op.value, 0) || 0;
        return saldoAtual;
    }),
});