// Cálculo de intervalos de datas para os filtros de período.

/**
 * Date para "yyyy-MM-dd" usando o dia LOCAL. O toISOString() usaria UTC: às 22h
 * no Brasil, já seria o dia seguinte.
 */
export function paraIso(data: Date): string {
  const ano = data.getFullYear()
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

export function diasAtras(dias: number, base = new Date()): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() - dias)
}

/**
 * Volta N meses sem "transbordar": 31/03 menos 1 mês é 28/02. Um cálculo direto
 * pediria 31/02, que o JavaScript transforma em 03/03.
 */
export function mesesAtras(meses: number, base = new Date()): Date {
  const ultimoDiaDoMesAlvo = new Date(base.getFullYear(), base.getMonth() - meses + 1, 0).getDate()
  return new Date(base.getFullYear(), base.getMonth() - meses, Math.min(base.getDate(), ultimoDiaDoMesAlvo))
}

export function primeiroDiaDoMes(data: Date): Date {
  return new Date(data.getFullYear(), data.getMonth(), 1)
}
