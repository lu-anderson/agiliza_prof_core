import {until} from 'selenium-webdriver'
import entradaNoConsole from 'readline-sync'
import {driver} from './Inicializar'
import DadosDoSistema from './DadosDoSistema';


export  abstract class Util{
    public async carregarPagina(url:string){
        await driver.get(url)        
    }

    public async opcoesNoConsole(opcoes:Array<string>, mensagem:string){       
        let indexDaOpcao = await entradaNoConsole.keyInSelect(opcoes, mensagem)       
        if(indexDaOpcao == -1){
            await this.carregarPagina('')
            return indexDaOpcao
        }else{
            return indexDaOpcao
        }
    }  
    
    public static async aguardarAjax(){
        //console.log('Ajax')
        let ajax = await driver.wait(until.elementLocated({ id: 'gx_ajax_notification' }),10000)        
        let visible = await ajax.isDisplayed()    
        if(visible){       
            //console.log('Ajax ON') 
            await driver.wait(until.elementIsNotVisible(ajax),10000).catch(() => {return})
            return visible    
        }else{        
            //await console.log('Ajax OFF') 
            return visible
        }        
    }

    public static async formatarContador(contador:Number){
        if(contador<=9){
            return "0"+contador
        }else{
            return contador.toString()
        }
    }
}