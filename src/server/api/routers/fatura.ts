import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";

export const faturaRouter = createTRPCRouter({
    create: protectedProcedure
    .input(z.object({ currentInvoice: z.number(), limit: z.number(), brand: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.creditCard.create({
            data: {
                currentInvoice: input.currentInvoice,
                limit: input.limit,
                brand: input.brand,
                user: { connect: { id: ctx.session.user.id } },
            },
        });
    }),
    update: protectedProcedure
    .input(z.object({ id: z.string().min(1), currentInvoice: z.number(), limit: z.number(), brand: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.creditCard.update({
            where: { id: input.id },
            data: {
                currentInvoice: input.currentInvoice,
                limit: input.limit,
                brand: input.brand,
            },
        });
    }),
    delete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
        return ctx.db.creditCard.delete({
            where: { id: input.id },
        });
    }),
    getAll: protectedProcedure.query(async ({ ctx }) => {
        const creditCards = await ctx.db.creditCard.findMany({
            where: { user: { id: ctx.session.user.id } },
        });
        return creditCards;
    }),
    getLatest: protectedProcedure.query(async ({ ctx }) => {
        const creditCard = await ctx.db.creditCard.findFirst({
            where: { user: { id: ctx.session.user.id } },
        });
        return creditCard;
    }),
});