import { useState } from 'react'
import './style.css'
import event from '../../services/eventos.json'

function CadastrarEvento() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')

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
    <div id="cadastrarEvento">
      <form onSubmit={handleSubmit}>
        <h1>Cadastrar Evento</h1>

        <label>Título:</label>
        <input
          type="text"
          placeholder="Digite o título do evento"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <label>Descrição:</label>
        <textarea
          placeholder="Digite a descrição do evento"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        ></textarea>

        <label>Data:</label>
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <button type="submit">Cadastrar Evento</button>
      </form>
    </div>
  )
}

export default CadastrarEvento