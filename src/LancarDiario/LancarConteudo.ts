import {driver} from '../Inicializar'
import { until, By, Key, Button, Origin } from 'selenium-webdriver';
import {DadosSistemaLancarConteudo, DadosDoSistema} from '../DadosDoSistema';
import { Util } from '../util';
import { elementIsVisible } from 'selenium-webdriver/lib/until';
import entradaNoConsole from 'readline-sync'


class LancarConteudo{
    public async entrarEmLancarConteudo(){
        try {
            await driver.get(DadosSistemaLancarConteudo.urlLancarConteudo)             
        } catch (error) {
            console.log(error)
            throw {msg:'Erro no método entrarEmLancarConteudo em LancarPresenca.ts' , error}            
        } 
    }

    public async selecionarTurma(codigoSerieAnoFaze:  String, numeroDoID: String){
        try {
            let elemento = await driver.findElement(By.id('GB_overlay')).catch(() => {})
            if(elemento != undefined){
                await driver.wait(until.stalenessOf(elemento), 10000)
            } 
            await driver.findElement(By
                    .css('#vGERMATCOD > option:nth-child('+codigoSerieAnoFaze+')')).click()
            await Util.aguardarAjax()
            await driver.findElement(By.className('btnConsultar')).click()
            await Util.aguardarAjax()
            await driver.findElement(By.id(DadosDoSistema.idBtnLancarAvaliacaoDiario+ numeroDoID)).click()
        } catch (error) {
            console.log(error)
            throw {msg: "Erro no método selecionarTurma em LancarPresenca"}
        }        
    }

    public async entrarNosIframes(){
        await Util.aguardarAjax()
        //Entrando no frame principal
        let iframe = await driver.wait(until.elementLocated({ className: 'GB_frame' }))    
        await driver.switchTo().frame(iframe)

        //Entrando no frame secundário
        let iframe2 = await driver.wait(until.elementLocated({ id: 'GB_frame' }))
        await driver.switchTo().frame(iframe2)
    }

    public async selecionarBimestreAvaliacao(bimestre:string) {
        try {  
            //Selecinando o bimestre        
            let inputBimestre = await driver.wait(until.elementLocated({ id: DadosDoSistema.idInputBimestre }),10000)
            await driver.wait(until.elementIsVisible(inputBimestre), 10000)
            
            await driver.findElement(By.xpath("//select[@id='"+DadosDoSistema.idInputBimestre+"']/option["+ bimestre + "]"))
                .click()       
            
            await Util.aguardarAjax()        
            
            let elementoBtnIncluirConteudo = await driver
                .wait(until.elementLocated(By.name(DadosSistemaLancarConteudo.nameBtnIncluirConteudo)),10000)

            await elementoBtnIncluirConteudo.click()
            
            await Util.aguardarAjax() 

            let janelas            
            do {
                janelas = await driver.getAllWindowHandles()       
                if(janelas.length != 2){
                    await elementoBtnIncluirConteudo.click()
                    await Util.aguardarAjax()
                    janelas = await driver.getAllWindowHandles() 
                }                      
            } while(janelas.length == 1);  
            await driver.switchTo().window(janelas[1])            
        } catch (error) {
            console.log(error)
            throw {msg:'Erro no método selecionarBimestreAvaliacao em LancarAvaliacao.ts', error }
        }
    }

}


export default LancarConteudo