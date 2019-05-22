import Inicializar, { driver } from './Inicializar'
import BuscarDadosSig from './BuscarDadosNoSig'
import entradaNoConsole from 'readline-sync'


class Main {
    constructor(){
                      
    }   
    
    async inicializar(){
        await new Inicializar().iniciar()
    }

    irParaPáginaInicial(){}

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
                    console.log(await this.buscarDados())
                    console.log('Dados Obtidos!')
                } catch (error) {
                    console.log('Erro ao buscar dados! Deseja tentar Novamente?')                    
                } 
            }

            if(acao == -1){
                fluxo = false
            }

        }
        

        
    }
}
new Main().app()