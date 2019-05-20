import {Builder, By, until, WebDriver} from 'selenium-webdriver'
import fs from 'fs'
import entradaNoConsole from 'readline-sync'
import DadosDoSistema from './DadosDoSistema'
import DadosDoUsuario from './DadosDoUsuario'
import { Util } from './util';

var driver:WebDriver

export {driver}

class Inicializar{
    private async inserirCredenciais(){        
        await driver.findElement(By.id(DadosDoSistema.idCampoLogin)).sendKeys(DadosDoUsuario.loginSigEduca)
        await driver.findElement(By.id(DadosDoSistema.idCampoSenha)).sendKeys(DadosDoUsuario.senhaSigEduca)      
    }

    private async pegarTokenEmBase64(){
        return await driver.findElement(By.id('vIMAGEMCAPTCHA')).getAttribute('src')
    }

    private async converterTokenBase64ParaPng(){
        const stringBase64 = await this.pegarTokenEmBase64()
        let matches:any
        if(stringBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) != null){
            matches = stringBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        }
        const bitmap = new Buffer(matches[2], 'base64')
        await fs.writeFileSync('../token/token.png', bitmap, 'binary')
    }

    //Precisa automatizar o recebimento do TOKEN
    private async receberToken(){
        return await entradaNoConsole.question('Codigo de Seguranca: ',) 
    }

    private async inserirToken(){
        return driver.findElement(By.id(DadosDoSistema.idCodigoDeSeguranca)).sendKeys(this.receberToken())
    }

    private async verificarErroDeToken(){
        await Util.aguardarAjax()
        let urlAtual = await driver.getCurrentUrl()
        do{  
            if(urlAtual == 'http://sigeduca.seduc.mt.gov.br/geral/hwlogin2.aspx'){
                //console.log('Esta esperando achar o elemento')
                try {
                    let erroDeLogin= await driver.wait(until.elementLocated(By.xpath("//span[@id='gxErrorViewer']/div")), 10000).getText()     
                    console.log(erroDeLogin)               
                    await this.validarLogin()
                } catch (error) {
                    return
                }                                             
            }else{                
                return
            }
            urlAtual = await driver.getCurrentUrl()
        }while(urlAtual == 'http://sigeduca.seduc.mt.gov.br/geral/hwlogin2.aspx')
    }

    public async validarLogin(){
        await this.converterTokenBase64ParaPng()
        await this.inserirToken()        
        await Util.clicarPorId(DadosDoSistema.idBtnEntrar)
        await Util.aguardarAjax()
        await this.verificarErroDeToken()
    }

    private async confirmarAnoLetivo(){
        await Util.aguardarCarregamentoDaPagina(DadosDoSistema.urlSegundaPagina)
        await driver.wait(until.elementLocated({ id: DadosDoSistema.idBtnConfirmarAno }))
        await driver.executeScript(DadosDoSistema.scriptSelecaoAnoLetivo) 
    }

    private async selecionarGED(){
        let el = await driver.wait(until.elementLocated({ id:  DadosDoSistema.idBtnGED}))    
        await driver.wait(until.elementIsVisible(el))
        await el.click()
    }

    private async selecionarSubModulo(){
        let urlAtual = await driver.getCurrentUrl()
        let regex = new RegExp('hwgedselecionamodulo');
        if (urlAtual.match(regex)) {                
            let el = await driver.wait(until.elementLocated({ id:  DadosDoSistema.idSelecionarSubModulo}))    
            await driver.wait(until.elementIsVisible(el))
            await el.click()
        }
    }    

    public async iniciar(){
        driver = await new Builder().forBrowser('firefox').build()
        await driver.get(DadosDoSistema.urlPaginaDeLogin)
        await this.inserirCredenciais()        
        await this.validarLogin()
        await this.confirmarAnoLetivo() 
        await this.selecionarGED()  
        await this.selecionarSubModulo()     
    }
}

export default Inicializar
