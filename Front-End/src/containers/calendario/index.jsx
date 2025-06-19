import { useState } from 'react'
import './style.css'
import event from '../../services/eventos.json'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlusSquare } from 'react-icons/fi'

function Calendario() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(hoje.getMonth()) // 0 = Janeiro
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear())
  const navigate = useNavigate()
  
  function handleAbrirHomeClick() {
      // Navega para a página do calendário
      navigate('/home') // Corrigido para minúsculo
  }
  
  function handleIncluirEventoClick() {
      // Navega para a página de incluir evento
      navigate('/eventos') // Corrigido para minúsculo
  }

  // Simulação dos eventos cadastrados
  const [eventos] = useState(
    event.eventos
  )

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril',
    'Maio', 'Junho', 'Julho', 'Agosto',
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  function gerarDiasDoMes(mes, ano) {
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)

    const dias = []

    const diaSemanaPrimeiro = primeiroDia.getDay() // 0 (domingo) a 6 (sábado)
    for (let i = 0; i < diaSemanaPrimeiro; i++) {
      dias.push(null)
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(dia)
    }

    return dias
  }

  const diasDoMes = gerarDiasDoMes(mesAtual, anoAtual)

  const mudarMes = (delta) => {
    let novoMes = mesAtual + delta
    let novoAno = anoAtual

    if (novoMes > 11) {
      novoMes = 0
      novoAno += 1
    }
    if (novoMes < 0) {
      novoMes = 11
      novoAno -= 1
    }

    setMesAtual(novoMes)
    setAnoAtual(novoAno)
  }

  function eventosDoDia(dia) {
    const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
    return eventos.filter(evento => evento.data === dataFormatada)
  }

  return (
    <div className="container-calendario">
      <div className="menu-lateral">
          <div className="cabecalho-menu">
              <h2>TechPlanner</h2>
          </div>
          <nav className="navegacao-menu">
              <button className="botao-navegacao" onClick={handleAbrirHomeClick}>
                  <FiHome className="icone-navegacao" />
                  <span>Home</span>
              </button>
              <button className="botao-navegacao ativo" onClick={() => navegar('/calendario')}>
                  <FiCalendar className="icone-navegacao" />
                  <span>Calendário</span>
              </button>
              <button className="botao-navegacao" onClick={handleIncluirEventoClick}>
                  <FiPlusSquare className="icone-navegacao" />
                  <span>Inserir Evento</span>
              </button>
          </nav>
      </div>

      <div className="calendario">
        <div className="cabecalho">
          <div className="botoes">
            <button onClick={() => mudarMes(-1)}>{'<'}</button>
            <button onClick={() => mudarMes(1)}>{'>'}</button>
            <button id="hoje" onClick={() => {
              setMesAtual(hoje.getMonth())
              setAnoAtual(hoje.getFullYear())
            }}>Hoje
            </button>
          </div>
          
          <h2 className="titulo-mes">{meses[mesAtual]} {anoAtual}</h2>
        </div>

        <div className="diasSemana">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>

        <div className="dias">
          {diasDoMes.map((dia, index) => (
            <div key={index} className={dia ? 'dia' : 'vazio'}>
              {dia && (
                <>
                  <div className="numeroDia">{dia}</div>
                  <div className="eventos">
                    {eventosDoDia(dia).map((evento, i) => (
                      <div key={i} className="evento">
                        {evento.titulo}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Calendario
