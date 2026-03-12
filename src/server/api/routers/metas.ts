import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const metasRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ title: z.string().min(1), targetAmount: z.number(), currentAmount: z.number(), deadline: z.date().optional() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.goal.create({
                data: {
                    title: input.title,
                    targetAmount: input.targetAmount,
                    currentAmount: input.currentAmount,
                    deadline: input.deadline,
                    user: { connect: { id: ctx.session.user.id } },
                },
            });
        }),
    update: protectedProcedure
    .input(z.object({ id: z.string().min(1), title: z.string().min(1), targetAmount: z.number(), currentAmount: z.number(), deadline: z.date().optional() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.goal.update({
            where: { id: input.id },
            data: {
                title: input.title,
                targetAmount: input.targetAmount,
                currentAmount: input.currentAmount,
                deadline: input.deadline,
            },
        });
    }),
    delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.goal.delete({
            where: { id: input.id },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const goals = await ctx.db.goal.findMany({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });
        return goals;
    }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
        const goal = await ctx.db.goal.findFirst({
            orderBy: { createdAt: "desc" },
            where: { user: { id: ctx.session.user.id } },
        });
        return goal;
    }),
    
});