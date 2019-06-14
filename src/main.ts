import entradaNoConsole from 'readline-sync'
import Inicializar, { driver } from './Inicializar'
import BuscarDadosSig from './BuscarDadosNoSig'
import ConexaoComBd from './ConexaoComBd'
import DadosDoSistema from './DadosDoSistema';
import DadosDoUsuario from './DadosDoUsuario'
import { By } from 'selenium-webdriver';
import { Util } from './util';



class Main {
    private User:any
    private bd = new ConexaoComBd
    constructor(){
                      
    }   
    
    async inicializar(){
        this.User = await this.bd.buscarUser('02462307117')
        DadosDoUsuario.loginSigEduca = this.User.loginSigEduca
        DadosDoUsuario.senhaSigEduca = this.User.senhaSigEduca
        await new Inicializar().iniciar()
    }

    private async escolasDoUser(){        
        let escolas = await this.User.escolas.map((e:string) =>{
            return e.toUpperCase()
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

    async selecionarLotacao(escolas:any){        
        let quantidadeDeEscolas = escolas.lenght
        if(quantidadeDeEscolas !== 1){
            await driver.get(DadosDoSistema.urlSelecionarLotacao)
            await driver.findElement(By.id(DadosDoSistema.idInputLotacao)).sendKeys(escolas[0])
            await driver.findElement(By.name(DadosDoSistema.nameBtnAtualizarLotacao))
            await Util.aguardarAjax()
            await driver.findElement(By.id(DadosDoSistema.idCodigoLotacao)).click()
            await Util.aguardarAjax()
        }
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
            console.log('Erro ao iniciar, quer tentar novamente? ', error)
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
                    let escolas = await this.escolasDoUser() 
                    let turmas = await new BuscarDadosSig().selecionarLotacao(escolas)
                    console.log('Dados Obtidos!')
                    await this.bd.salvarTurmas(turmas, this.User._id)
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