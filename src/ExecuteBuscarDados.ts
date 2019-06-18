import Inicializar ,{driver} from './Inicializar'
import ConexaoComBd from './ConexaoComBd'


class ExecuteBuscarDados {
    private bd = new ConexaoComBd()
    private users =  []
    public async iniciar(){
        this.users = await this.bd.userSemDados()
        console.log(this.users)
    }
} 

new ExecuteBuscarDados().iniciar()