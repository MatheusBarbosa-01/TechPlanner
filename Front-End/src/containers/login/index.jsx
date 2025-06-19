import { useNavigate } from 'react-router-dom'
import '../login/style.css'
import api from '../../services/api.json'
import { useRef } from 'react'

function Login () {
  const navigate = useNavigate()
  const matriculaRef = useRef()

  function send(e) {
    e.preventDefault()
    const matricula = matriculaRef.current.value
    let encontrado = false

    api.Alunos.forEach(v => {
      if (v.matrícula === matricula) {
        alert(v.nome)
        encontrado = true
      }
    })

    api.Professor.forEach(v => {
      if (v.matrícula === matricula) {
        alert(v.nome)
        encontrado = true
      }
    })

    if (encontrado) {
      navigate('/home') // redireciona para a home
    } else {
      alert('Matrícula não encontrada')
    }
  }

  return (
    <div id="login">
      <form onSubmit={send}>
        <div id="modalLogin">
          <div id="blueModal">
            <p>Olá!</p><br />
            <p>Coloque as informações para entrar em sua conta</p>
          </div>
          <div id="whiteModal">
            <h1>ENTRE AQUI</h1>
            <input ref={matriculaRef} type="text" placeholder="Digite sua matrícula" />
            <input type="password" placeholder="Digite sua senha" />
            <button type="submit">Entre</button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Login
