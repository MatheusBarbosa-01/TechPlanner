import Button from "../../components/button";
import './style.css'
import api from '../../services/api.json'

function Login (){
    const matricula = document.querySelector('#matricula')

    function send(e){
        e.preventDefault()

        api.Alunos.forEach( v => {
            if(v.matrícula === matricula.value){
                alert(v.nome)
            }
        })
        api.Professor.forEach( v => {
            if(v.matrícula === matricula.value){
                alert(v.nome)
            }
        })
    }

    return (
        <div id="login">
            <form onSubmit={send}>
                <div id="modalLogin">
                    <div id="blueModal">
                        <p>Olá!</p><br/>
                        <p>Coloque as informações para entrar em sua conta</p>
                    </div>
                    <div id="whiteModal">
                        <h1>ENTRE AQUI</h1>
                        <input id="matricula" type="text" placeholder="Digite sua matrícula"/>
                        <input id="senha" type="password" placeholder="Digite sua senha"/>
                        <Button></Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Login