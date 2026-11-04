/**
 * Os investimentos que podem ser comparados. A API devolve a lista sempre nesta
 * ordem e o nome do CDB muda ("CDB 110% do CDI"), por isso a ligação com cada
 * resultado é feita pela posição (`indice`), e não pelo nome.
 */
export const PRODUTOS = [
  { id: 'cdb', nome: 'CDB', indice: 0 },
  { id: 'tesouro', nome: 'Tesouro Selic', indice: 1 },
  { id: 'poupanca', nome: 'Poupança', indice: 2 },
] as const

export type IdProduto = (typeof PRODUTOS)[number]['id']
