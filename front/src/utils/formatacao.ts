// Formatação em pt-BR com Intl, a API de internacionalização do próprio navegador.
// Os formatadores ficam fora das funções porque criá-los tem custo: basta uma vez.

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const cotacao = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
})

const numeroDuasCasas = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const data = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
})

const diaMes = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' })

const mesAno = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' })

const mesAnoLongo = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

/**
 * Converte "yyyy-MM-dd" em Date sempre em UTC, e os formatadores acima também
 * usam UTC. Assim o dia nunca muda: no Brasil (UTC-3), interpretar a data em
 * horário local mostraria 03/11 para o dado do dia 04/11.
 */
function paraDataUtc(dataIso: string): Date {
  const [ano, mes, dia] = dataIso.split('-').map(Number)
  return new Date(Date.UTC(ano, mes - 1, dia))
}

/** Valores em reais: R$ 1.234,56 */
export function formatarMoeda(valor: number): string {
  return moeda.format(valor)
}

/** Dólar e euro, com 4 casas: R$ 5,4935 */
export function formatarCotacao(valor: number): string {
  return cotacao.format(valor)
}

/**
 * Taxas: 13,75%. A API já manda o número em pontos percentuais (13.75), por isso
 * não dá para usar o estilo "percent" do Intl, que multiplicaria por 100.
 */
export function formatarTaxa(valor: number): string {
  return `${numeroDuasCasas.format(valor)}%`
}

/** Datas: 04/11/2026 */
export function formatarData(dataIso: string): string {
  return data.format(paraDataUtc(dataIso))
}

/** Número simples com 2 casas: 0,25 */
export function formatarNumero(valor: number): string {
  return numeroDuasCasas.format(valor)
}

/** Dia e mês, para o eixo de períodos curtos: 04/11 */
export function formatarDiaMes(dataIso: string): string {
  return diaMes.format(paraDataUtc(dataIso))
}

/** Mês e ano curtos, para o eixo de períodos longos: nov/26 */
export function formatarMesAno(dataIso: string): string {
  // O Intl devolve "nov. de 26"
  return mesAno.format(paraDataUtc(dataIso)).replace(/\.? de /, '/')
}

/** Mês por extenso, para indicadores mensais: setembro de 2026 */
export function formatarMesAnoLongo(dataIso: string): string {
  return mesAnoLongo.format(paraDataUtc(dataIso))
}
