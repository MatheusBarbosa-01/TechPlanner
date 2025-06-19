import '../home/style.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiHome, FiCalendar, FiPlusSquare } from 'react-icons/fi'

function Home (){
    const location = useLocation()
    const navigate = useNavigate()
    const userName = location.state?.userName || 'Usuário'
    
    function handleAbrirCalendarioClick() {
        // Navega para a página do calendário
        navigate('/calendario') // Corrigido para minúsculo
    }

    function handleIncluirEventoClick() {
        // Navega para a página de incluir evento
        navigate('/eventos') // Corrigido para minúsculo
    }

    return (
        <div className="container-home">
            <div className="menu-lateral">
                <div className="cabecalho-menu">
                    <h2>TechPlanner</h2>
                </div>
                <nav className="navegacao-menu">
                    <button className="botao-navegacao ativo" onClick={() => navegar('/home')}>
                        <FiHome className="icone-navegacao" />
                        <span>Home</span>
                    </button>
                    <button className="botao-navegacao" onClick={handleAbrirCalendarioClick}>
                        <FiCalendar className="icone-navegacao" />
                        <span>Calendário</span>
                    </button>
                    <button className="botao-navegacao" onClick={handleIncluirEventoClick}>
                        <FiPlusSquare className="icone-navegacao" />
                        <span>Inserir Evento</span>
                    </button>
                </nav>
            </div>

            <div className="conteudo-principal">
                <h1>Bem vindo(a), {userName}!</h1>
            </div>
        </div>
    )
}

export default Home