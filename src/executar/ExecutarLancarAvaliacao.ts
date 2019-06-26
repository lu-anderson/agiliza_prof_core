import Inicializar, {driver, By} from '../Inicializar'
import ConexaoComBd from '../ConexaoComBd'

class ExecutarLancarAvaliacao {
    private bd = new ConexaoComBd()
    private users: any
    private turmas: any

    private async buscarUserComAlteracoes(){
        this.users = await this.bd.usersComAlteracao()        
    }

    private async buscarTurmasComAlteracoes(){
        this.turmas = await this.bd.turmasComAlteracao(this.users[0]._id)
    }

    public async iniciar(){        
        await this.buscarUserComAlteracoes()
        console.log(this.users)
        await this.buscarTurmasComAlteracoes()
        console.log(this.turmas)
    }
}

new ExecutarLancarAvaliacao().iniciar()