import entradaNoConsole from 'readline-sync'
import Inicializar, { driver } from './Inicializar'
import BuscarDadosSig from './BuscarDadosNoSig'
import ConexaoComBd from './ConexaoComBd'



class Main {
    private User:any
    private bd = new ConexaoComBd
    constructor(){
                      
    }   
    
    async inicializar(){
        await new Inicializar().iniciar()
    }

    private async escolasDoUser(){        
        let escolas = await this.User._escolas.map((e:any) =>{
            return e.nome.toUpperCase()
        })
        console.log(escolas)
        return escolas        
    }

    irParaPaginaInicial(){}

    irParaLancarAvaliacao(){}


    async buscarDados(){
        let turmas = await new BuscarDadosSig().start()
        return turmas
    }

    fecharDriver(){}

    trocarUsuarioViaTerminal(){}

    async app(){
        let fluxo = true
        let opcoes = ['Lancar Avaliacao', 'Buscar Dados','Trocar De Usuario' ,'Sair']
        this.User = await this.bd.buscarUser('03723357130')
        console.log(this.User._escolas[0]._id)
        let escolas = await this.escolasDoUser()         
        console.log('Iniciando...')
        try {
            await this.inicializar()
        } catch (error) {
            console.log('Erro ao iniciar, quer tentar novamente?')
            let tentarNovamente = entradaNoConsole.keyInSelect(['Sim', 'Nao'], '')
            if(tentarNovamente == 0){
                await this.app()
            }else{
                await driver.close()
            }
        }
        

        while(fluxo){
            let acao = entradaNoConsole.keyInSelect(opcoes, 'O que voce deseja fazer?')
            if(opcoes[acao] == 'Lancar Avaliacao'){
                try {
                    
                } catch (error) {
                    console.log('Erro ao Inicializar!')
                    await this.app()
                } 
            }

            if(opcoes[acao] == 'Buscar Dados'){
                try {
                    console.log('Buscando dados ...')
                    let turmas = await new BuscarDadosSig().start()
                    console.log('Dados Obtidos!')
                    await this.bd.salvarTurmas(turmas, this.User._escolas[0]._id)
                } catch (error) {
                    console.log('Erro ao buscar dados! Deseja tentar Novamente?') 
                    console.log(error)                   
                } 
            }

            if(acao == -1){
                fluxo = false
            }

        }
        

        
    }
}
new Main().app()