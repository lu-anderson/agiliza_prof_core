import Inicializar, {driver, By} from '../Inicializar'
import ConexaoComBd from '../ConexaoComBd'
import DadosDoUsuario from '../DadosDoUsuario'
import LancarAvaliacao from '../LancarAvaliacao';

class ExecutarLancarAvaliacao {
    private bd = new ConexaoComBd()
    private users: any
    private turmas: any

    private async buscarUserComAlteracoes(){
        this.users = await this.bd.usersComAlteracao()   
        console.log(this.users)     
    }

    private async buscarTurmasComAlteracoes(){
        this.turmas = await this.bd.turmasComAlteracao(this.users[0]._id)
    }

    public async iniciar(){
        await this.buscarUserComAlteracoes()
        console.log(this.users)
        if(this.users.lenght !== 0){
            console.log('aqui')
            await this.buscarTurmasComAlteracoes()
            console.log(this.turmas)           
            await Inicializar.iniciar()
            DadosDoUsuario.loginSigEduca = this.users[0].loginSigEduca
            DadosDoUsuario.senhaSigEduca = this.users[0].senhaSigEduca
            await Inicializar.logar()
            await new LancarAvaliacao().start(this.turmas)
        }
    }
}

new ExecutarLancarAvaliacao().iniciar()