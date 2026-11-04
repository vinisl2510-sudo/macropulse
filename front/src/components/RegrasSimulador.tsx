const FAIXAS_IR = [
  { prazo: 'Até 180 dias', aliquota: '22,5%' },
  { prazo: '181 a 360 dias', aliquota: '20%' },
  { prazo: '361 a 720 dias', aliquota: '17,5%' },
  { prazo: 'Acima de 720 dias', aliquota: '15%' },
]

export function RegrasSimulador() {
  return (
    <section className="secao" aria-labelledby="titulo-regras">
      <h2 id="titulo-regras">Como o cálculo é feito</h2>

      <div className="regras">
        <div>
          <h3>IR regressivo</h3>
          <p>Incide só sobre o rendimento do CDB e do Tesouro Selic. Quanto maior o prazo, menor a alíquota.</p>
          <table className="tabela-ir">
            <thead>
              <tr>
                <th scope="col">Prazo</th>
                <th scope="col">Alíquota</th>
              </tr>
            </thead>
            <tbody>
              {FAIXAS_IR.map((faixa) => (
                <tr key={faixa.prazo}>
                  <td>{faixa.prazo}</td>
                  <td>{faixa.aliquota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3>Rentabilidade</h3>
          <ul>
            <li>
              <strong>CDI:</strong> estimado como Selic − 0,10 ponto percentual.
            </li>
            <li>
              <strong>CDB:</strong> rende o percentual do CDI informado.
            </li>
            <li>
              <strong>Tesouro Selic:</strong> rende a Selic.
            </li>
            <li>
              <strong>Poupança:</strong> 0,5% ao mês (cerca de 6,17% ao ano) quando a Selic é maior que 8,5%; senão, 70%
              da Selic. É isenta de IR.
            </li>
            <li>
              <strong>Juros compostos:</strong> valor × (1 + taxa)<sup>dias / 365</sup>.
            </li>
          </ul>
        </div>

        <div>
          <h3>Simplificações</h3>
          <ul>
            <li>Sem IOF, que incide em resgates antes de 30 dias.</li>
            <li>Sem TR na poupança.</li>
            <li>Sem taxa de custódia.</li>
            <li>Selic constante durante todo o prazo.</li>
          </ul>
          <p className="regras__aviso">Esta simulação é educativa e não é recomendação de investimento.</p>
        </div>
      </div>
    </section>
  )
}
