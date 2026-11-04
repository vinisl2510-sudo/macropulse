import { CartoesIndicadores } from '../components/CartoesIndicadores'
import { PainelGraficos } from '../components/PainelGraficos'
import { SecaoApi } from '../components/SecaoApi'
import '../styles/painel.css'

export function Painel() {
  return (
    <>
      <title>Painel | MacroPulse</title>

      <header className="topo-pagina">
        <h1>O pulso da economia brasileira</h1>
        <p>
          Selic, dólar, euro e inflação com dados oficiais do Banco Central, coletados todo dia útil por uma API em Java
          com Spring Boot.
        </p>
      </header>

      <section aria-label="Indicadores atuais">
        <CartoesIndicadores />
      </section>

      <section className="secao" aria-labelledby="titulo-historico">
        <h2 id="titulo-historico">Histórico</h2>
        <PainelGraficos />
      </section>

      <SecaoApi />
    </>
  )
}
