import {Builder, By, until, WebDriver} from 'selenium-webdriver'
import IdsENames from './IdsENames'
import DadosDoUsuario from './DadosDoUsuario'
import fs from 'fs'
var driver:WebDriver


class Inicializar{
    private async inserirCredenciais(){
        try {
            await driver.findElement(By.id(IdsENames.idCampoLogin)).sendKeys(DadosDoUsuario.loginSigEduca)
            await driver.findElement(By.id(IdsENames.idCampoSenha)).sendKeys(DadosDoUsuario.senhaSigEduca)
        } catch (error) {
            console.log(error)
        }
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

    public async iniciar(){
        driver = await new Builder().forBrowser('firefox').build()
        await driver.get('http://sigeduca.seduc.mt.gov.br/geral/hwlogin2.aspx')
        await this.inserirCredenciais()
        await this.converterTokenBase64ParaPng()
    }
}

export default Inicializar