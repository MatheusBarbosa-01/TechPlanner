import { useState } from 'react'
import './style.css'
import event from '../../services/eventos.json'
import { useNavigate } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlusSquare } from 'react-icons/fi'

function CadastrarEvento() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const navigate = useNavigate()

  function handleAbrirHomeClick() {
      // Navega para a página do calendário
      navigate('/home') // Corrigido para minúsculo
  }
  
  function handleCalendarioClick() {
      // Navega para a página de incluir evento
      navigate('/calendario') // Corrigido para minúsculo
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!titulo || !descricao || !data) {
      alert('Preencha todos os campos!')
      return
    }

    const novoEvento = {
      titulo,
      descricao,
      data
    }

    event.eventos.push(novoEvento)

    console.log('Evento cadastrado:', novoEvento, event.eventos)
    alert('Evento cadastrado com sucesso!')

    setTitulo('')
    setDescricao('')
    setData('')
  }

  return (
    <div className="container-eventos">
      <div className="menu-lateral">
          <div className="cabecalho-menu">
              <h2>TechPlanner</h2>
          </div>
          <nav className="navegacao-menu">
              <button className="botao-navegacao" onClick={handleAbrirHomeClick}>
                  <FiHome className="icone-navegacao" />
                  <span>Home</span>
              </button>
              <button className="botao-navegacao" onClick={handleCalendarioClick}>
                  <FiCalendar className="icone-navegacao" />
                  <span>Calendário</span>
              </button>
              <button className="botao-navegacao ativo" onClick={() => navigate('/eventos')}>
                  <FiPlusSquare className="icone-navegacao" />
                  <span>Inserir Evento</span>
              </button>
          </nav>
      </div>

      <div className="conteudo-formulario">
        <form onSubmit={handleSubmit}>
          <h1 id='titulo'>Cadastrar Evento</h1>

          <label>Título:</label>
          <input
            type="text"
            placeholder="Digite o título do evento"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <label>Descrição:</label>
          <textarea
            id='inputDescricao'
            placeholder="Digite a descrição do evento"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          ></textarea>

          <label>Data:</label>
          <input
            id="inputDate"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <button type="submit">Cadastrar</button>
        </form>
      </div>
    </div>
  )
}

export default CadastrarEvento