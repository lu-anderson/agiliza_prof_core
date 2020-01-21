import Inicializar ,{driver, By} from '../Inicializar'
import ConexaoComBd from '../ConexaoComBd'
import DadosDoUsuario from '../DadosDoUsuario'
import BuscarDadosSig from '../BuscarDadosNoSig'


class ExecuteBuscarDados {
    private bd = new ConexaoComBd()
    private users: any  
    
    

    private async escolasDoUser(user:any){
        try {
            let escolas = await user.escolas.map((e:string) =>{
                return e.toUpperCase()
            })  
            return escolas  
        } catch (error) {
            console.log('Erro no método escolasDoUser em main.ts')
            console.log(error)
        }     
    }

    public async iniciar(){
        let cont = 0
        try {
            this.users = await this.bd.userSemDados()
            console.log(this.users)
            if(this.users.length === 0){
                console.log('Não existe usuários sem dados salvos no banco de dados')
            }else{
                await Inicializar.iniciar()
                do{
                    DadosDoUsuario.loginSigEduca = this.users[cont].loginSigEduca
                    DadosDoUsuario.senhaSigEduca = this.users[cont].senhaSigEduca
                    let escolas = await this.escolasDoUser(this.users[cont])                                   
                    await Inicializar.logar() 
                    let turmas
                    console.log(this.users[cont])
                    if(this.users[cont].isPedagogo){
                        console.log('pedagogo')
                        turmas = await new BuscarDadosSig().buscarTurmaPegadogo(escolas)
                    }else{
                        console.log('De área')
                        turmas = await new BuscarDadosSig().iniciar(escolas) 
                    }
                     
                                 
                    //await this.bd.salvarNewTurmas(turmas, this.users[cont]._id) 
                    await this.bd.salvarTurmas(turmas, this.users[cont]._id)               
                    if(escolas.length !== 1){
                        await driver.findElement(By.xpath('/html/body/form/p[1]/table/tbody/tr[2]/td/div/table/tbody/tr[3]/td/div/div/table/tbody/tr/td[4]')).click()
                    }else{
                        await driver.findElement(By.xpath('/html/body/form/p[1]/table/tbody/tr[2]/td/div/table/tbody/tr[3]/td/div/div/table/tbody/tr/td[3]')).click()
                    }
                    cont++
                }while(cont < this.users.length) 
            }
            
        } catch (error) {
            console.log(error)
        }
    }

    
    
} 

new ExecuteBuscarDados().iniciar()