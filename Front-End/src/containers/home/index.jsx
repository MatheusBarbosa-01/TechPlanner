import '../home/style.css'
import { useLocation, useNavigate } from 'react-router-dom'

function Home (){
    const location = useLocation()
    const navigate = useNavigate()
    const userName = location.state?.userName || 'Usuário'

    function handleIncluirEventoClick() {
        // Navega para a página de incluir evento
        navigate('/eventos') // Corrigido para minúsculo
    }

    function handleAbrirCalendarioClick() {
        // Navega para a página do calendário
        navigate('/calendario') // Corrigido para minúsculo
    }

    return (
        <div>
           <h1>Bem vindo(a), {userName}!</h1>
           <p>Clique aqui para incluir um evento no seu calendário.</p>
           <button id='btnIncluirEvento' onClick={handleIncluirEventoClick}>Incluir evento</button>
            <p>Clique aqui para abrir o seu calendário.</p>
            <button id='btnAbrirCalendario' onClick={handleAbrirCalendarioClick}>Abrir calendário</button>
        </div>
    )
}

export default Home