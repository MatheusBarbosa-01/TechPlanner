import Button from "../../components/button";
import './style.css'

function Login (){
    return (
        <div id="modalLogin">
            <div id="blueModal">
                <p>Olá!</p><br/>
                <p>Coloque as informações para entrar em sua conta</p>
            </div>
            <div id="whiteModal">
                <h1>ENTRE AQUI</h1>
                <input type="text" placeholder="Digite sua matrícula"/>
                <input type="password" placeholder="Digite sua senha"/>
                <Button></Button>
            </div>
        </div>
    )
}

export default Login