import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
        .input(z.object({ 
            title: z.string().min(1), 
            tagId: z.string().optional(), 
            description: z.string().optional(), 
            value: z.number(), 
            type: z.enum(["INCOME", "EXPENSE"]),
            metaId: z.string().optional(),
            limiteId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            
            const meta = input.metaId ? await ctx.db.goal.findUnique({ where: { id: input.metaId } }) : null;
            const limite = input.limiteId ? await ctx.db.limit.findUnique({ where: { id: input.limiteId } }) : null;
            if (meta) {
                await ctx.db.goal.update({
                    where: { id: input.metaId },
                    data: { currentAmount: meta.currentAmount + input.value },
                });
            }
            if (limite) {
                await ctx.db.limit.update({
                    where: { id: input.limiteId },
                    data: { currentSpent: limite.currentSpent + input.value },
                });
            }
            return ctx.db.transaction.create({
                data: {
                    title: input.title,
                    description: input.description ?? "",
                    value: input.value,
                    tag: input.tagId ? { connect: { id: input.tagId } } : undefined,
                    type: input.type,
                    user: { connect: { id: ctx.session.user.id } },
                    meta: input.metaId ? { connect: { id: input.metaId } } : undefined,
                    limite: input.limiteId ? { connect: { id: input.limiteId } } : undefined,
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
    .input(z.object({ 
        id: z.string().min(1), 
        title: z.string().min(1), 
        tagId: z.string().optional(), 
        description: z.string().optional(), 
        value: z.number(), 
        type: z.enum(["INCOME", "EXPENSE"]),
        metaId: z.string().optional(),
        limiteId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
        return await ctx.db.$transaction(async (tx) => {
            // 1. Busca a transação antiga para saber o que "desfazer"
            const oldOp = await tx.transaction.findUnique({
                where: { id: input.id },
            });

            if (!oldOp || oldOp.userId !== ctx.session.user.id) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Operação não encontrada.",
                });
            }

            // --- PASSO 1: REMOVER IMPACTO ANTIGO ---
            // Se tinha meta antiga, subtrai o valor antigo dela
            if (oldOp.metaId) {
                await tx.goal.update({
                    where: { id: oldOp.metaId },
                    data: { currentAmount: { decrement: oldOp.value } },
                });
            }
            // Se tinha limite antigo, subtrai o gasto antigo dele
            if (oldOp.limiteId) {
                await tx.limit.update({
                    where: { id: oldOp.limiteId },
                    data: { currentSpent: { decrement: oldOp.value } },
                });
            }

            // --- PASSO 2: APLICAR IMPACTO NOVO ---
            // Se o novo input tem meta (mesma ou nova), soma o novo valor
            if (input.metaId) {
                await tx.goal.update({
                    where: { id: input.metaId },
                    data: { currentAmount: { increment: input.value } },
                });
            }
            // Se o novo input tem limite (mesmo ou novo), soma o novo valor
            if (input.limiteId) {
                await tx.limit.update({
                    where: { id: input.limiteId },
                    data: { currentSpent: { increment: input.value } },
                });
            }

            // --- PASSO 3: ATUALIZAR A TRANSAÇÃO ---
            return tx.transaction.update({
                where: { id: input.id },
                data: {
                    title: input.title,
                    description: input.description ?? "",
                    value: input.value,
                    type: input.type,
                    // Connect/Disconnect lida com a mudança de IDs ou remoção total
                    tag: input.tagId ? { connect: { id: input.tagId } } : { disconnect: true },
                    meta: input.metaId ? { connect: { id: input.metaId } } : { disconnect: true },
                    limite: input.limiteId ? { connect: { id: input.limiteId } } : { disconnect: true },
                },
            });
        });
    }),
    delete: protectedProcedure
        .input(z.object({ id: z.string().min(1) }))
        .mutation(async ({ ctx, input }) => {
            return await ctx.db.$transaction(async (tx) => {
                const transaction = await tx.transaction.findUnique({
                    where: { id: input.id },
                });

                if (!transaction || transaction.userId !== ctx.session.user.id) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Transaction not found or not specialized to you.",
                    });
                }

                // Reverse impacts on goals and limits
                if (transaction.metaId) {
                    await tx.goal.update({
                        where: { id: transaction.metaId },
                        data: { currentAmount: { decrement: transaction.value } },
                    });
                }
                if (transaction.limiteId) {
                    await tx.limit.update({
                        where: { id: transaction.limiteId },
                        data: { currentSpent: { decrement: transaction.value } },
                    });
                }

                return tx.transaction.delete({
                    where: { id: input.id },
                });
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