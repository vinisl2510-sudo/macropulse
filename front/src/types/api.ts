// Tipos que espelham os DTOs da API Java. Datas chegam sempre como "yyyy-MM-dd".

export type CotacaoDTO = {
  data: string
  valor: number
}

export type VariacaoDTO = {
  dias: number
  valorInicial: number
  valorFinal: number
  variacaoPorcentual: number
}

export type JuroRealDTO = {
  selic: number
  /** IPCA ESPERADO para 12 meses (boletim Focus), não o IPCA realizado. */
  ipca: number
  juroReal: number
  dataPrevista: string
}

export type SimulacaoRequestDTO = {
  valor: number
  prazoDias: number
  percentualCdi: number
}

export type ResultadoInvestimentoDTO = {
  /** "CDB 110% do CDI" (dinâmico), "Tesouro Selic" ou "Poupança". */
  produto: string
  valorBruto: number
  rendimentoBruto: number
  impostoRenda: number
  valorLiquido: number
  rendimentoLiquido: number
}

export type SimulacaoResponseDTO = {
  valorInvestido: number
  prazoDias: number
  selicUsada: number
  /** Vem sempre nesta ordem: CDB, Tesouro Selic, Poupança. */
  resultados: ResultadoInvestimentoDTO[]
}

/** Formato de erro da API (RFC 9457), usado nos status 400, 404 e 503. */
export type ProblemDetail = {
  title: string
  status: number
  detail: string
  instance: string
}
