import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

// Definimos os arrays de valores para garantir sincronia com o banco sem importar o @prisma/client no runtime do tRPC
const AVISO_TIPOS = ["AVISO", "VENCIMENTO", "COBRANCA"] as const;
const RECORRENCIA_TIPOS = ["NENHUMA", "DIARIA", "SEMANAL", "MENSAL", "ANUAL"] as const;

export const avisosRouter = createTRPCRouter({
  
  // Criar aviso atrelado ao usuário logado
  create: protectedProcedure
    .input(z.object({
      nome: z.string().min(1),
      descricao: z.string().optional(),
      valor: z.number(),
      data: z.date(),
      // Usamos z.enum para evitar problemas de importação de Enums do Prisma no lado do cliente
      tipo: z.enum(AVISO_TIPOS),
      recorrencia: z.enum(RECORRENCIA_TIPOS),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.aviso.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      });
    }),

  // Listar apenas os avisos do usuário logado (não pagos)
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.aviso.findMany({
      where: { 
        userId: ctx.session.user.id,
        pago: false 
      },
      orderBy: { data: "asc" },
    });
  }),

  // Lógica de "Resolver" (Marcar como pago ou calcular próxima recorrência)
  resolver: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const aviso = await ctx.db.aviso.findFirst({
        where: { id: input.id, userId: ctx.session.user.id },
      });

      if (!aviso) throw new Error("Aviso não encontrado ou acesso negado");

      // Se não houver recorrência, apenas finaliza
      if (aviso.recorrencia === "NENHUMA") {
        return ctx.db.aviso.update({
          where: { id: input.id },
          data: { pago: true },
        });
      }

      // Calcula a próxima data com base no tipo de recorrência
      const novaData = new Date(aviso.data);
      
      if (aviso.recorrencia === "DIARIA") novaData.setDate(novaData.getDate() + 1);
      else if (aviso.recorrencia === "SEMANAL") novaData.setDate(novaData.getDate() + 7);
      else if (aviso.recorrencia === "MENSAL") novaData.setMonth(novaData.getMonth() + 1);
      else if (aviso.recorrencia === "ANUAL") novaData.setFullYear(novaData.getFullYear() + 1);

      return ctx.db.aviso.update({
        where: { id: input.id },
        data: { data: novaData },
      });
    }),

  // Deletar permanentemente
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.aviso.deleteMany({
        where: { 
          id: input.id, 
          userId: ctx.session.user.id 
        },
      });
    }),
});