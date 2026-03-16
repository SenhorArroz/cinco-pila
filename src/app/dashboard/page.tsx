import { api } from "~/trpc/server";
import DashboardCincoPila from "./DashboardCincoPila";

// Aqui as configurações de servidor funcionam sem erro
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  // Buscamos os dados direto no servidor antes de renderizar
  const todasOperacoes = await api.operacoes.getAll();
  const saldoAtual = await api.operacoes.saldoAtual();
  const dailyIncomes = await api.operacoes.getDailyIncomes();
  const dailyExpenses = await api.operacoes.getDailyExpenses();
  const limits = await api.limites.getAll();
  const goals = await api.metas.getAll();
  const avisosDB = await api.avisos.getAll();

  return (
    <DashboardCincoPila 
      initialData={{
        todasOperacoes,
        saldoAtual,
        dailyIncomes,
        dailyExpenses,
        limits,
        goals,
        avisosDB
      }}
    />
  );
}