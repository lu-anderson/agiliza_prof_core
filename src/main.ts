import entradaNoConsole from 'readline-sync'
import fs from 'fs'
import Inicializar, { driver } from './Inicializar'
import BuscarDadosSig from './BuscarDadosNoSig'
import ConexaoComBd from './ConexaoComBd'
import {DadosDoSistema} from './DadosDoSistema'
import DadosDoUsuario from './DadosDoUsuario'
import { By } from 'selenium-webdriver'
import { Util } from './util'


class Main {
    private User:any
    private bd = new ConexaoComBd
     
    private async buscarUserNoBd(){
        try{
            console.log('Informe o usuário: ')
            const user = await entradaNoConsole.question('')
            this.User = await this.bd.buscarUser(user)
            DadosDoUsuario.loginSigEduca = this.User.loginSigEduca
            DadosDoUsuario.senhaSigEduca = this.User.senhaSigEduca
        }catch(error) {
            if(error.msg === 'Usuário não encontrado'){
                console.log(error.msg)
                await this.buscarUserNoBd()
            }else{
                throw error
            }            
        }
    }

    private async iniciar(){
        try {
            await Inicializar.iniciar()                  
        } catch(error) {            
            console.log(error.msg)
            const opcoes = ["Sim", "Nao"]
            const acao = await entradaNoConsole.keyInSelect(opcoes, 'Deseja iniciar novamente?')
            if(opcoes[acao] === "Sim"){
                await this.iniciar()
            }else{
                throw error
            }
        }
    }

    private async escolasDoUser(){
        try {
            let escolas = await this.User.escolas.map((e:string) =>{
                return e.toUpperCase()
            })  
            return escolas  
        } catch (error) {
            console.log('Erro no método escolasDoUser em main.ts')
            console.log(error)
        }     
    }

    irParaPaginaInicial(){}

    irParaLancarAvaliacao(){}


    async buscarDados(){
        
    }    

    public async buscarUserSemDados(){
        await this.bd.userSemDados()
    }

    public async app(){        
        let fluxo = true
        let opcoes = ['Trocar De Usuario' ,'Sair']
        console.log('Iniciando...')
        try {
            await this.buscarUserNoBd()                    
        } catch (error) {            
            console.log('Erro ao buscarUser! ')
            console.log(error)
        }

        try {
            await this.iniciar()
        } catch (error) {
            console.log('Erro ao iniciar')
            console.log(error.error)
            fluxo = false
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
                    let turmas = await new BuscarDadosSig().iniciar(escolas)
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
new Main().buscarUserSemDados()