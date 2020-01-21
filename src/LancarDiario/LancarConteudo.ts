import {driver} from '../Inicializar'
import { until, By, Key, Button, Origin } from 'selenium-webdriver';
import {DadosSistemaLancarConteudo, DadosDoSistema} from '../DadosDoSistema';
import { Util } from '../util';
import { elementIsVisible, alertIsPresent, elementLocated } from 'selenium-webdriver/lib/until';
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

    public async lancarConteudo(diarioDeConteudo: any){
        for(let j = 0; j < diarioDeConteudo.diarioDeConteudo.length; j++){
            if(j%2 === 0){
                let contadorFormatado = await Util.formatarContador(j+1)
                await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDTA_000100${contadorFormatado}`)),15000)
                .sendKeys(diarioDeConteudo.diarioDeConteudo[j].data.replace(/ /g,""))
                console.log(`vGGEDCONPROGDTA_000100${contadorFormatado}`)
                await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDSC_000100${contadorFormatado}`)),15000)
                .sendKeys(diarioDeConteudo.diarioDeConteudo[j].conteudo.texto)
            }

            if(j%2 === 1){
                let contadorFormatado = await Util.formatarContador(j)
                await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDTA_000200${contadorFormatado}`)),15000)
                .sendKeys(diarioDeConteudo.diarioDeConteudo[j].data.replace(/ /g,""))
                await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDSC_000200${contadorFormatado}`)),15000)
                .sendKeys(diarioDeConteudo.diarioDeConteudo[j].conteudo.texto)
            }
        }
    }

    public async clicarEmIncluir(){
        await driver.findElement(By.name('BUTTONCONFIRMAR')).click()
    }

    public async confirmarInclusao(){
        let alerta = await driver.wait(alertIsPresent())
        await alerta.accept()
    }

    public async analisarMensagemDeRetorno(){
        let janelas  

        do{
            janelas = await driver.getAllWindowHandles()
        }while(janelas.length !== 3)

        await driver.switchTo().window(janelas[2])

        let elementoAviso = await driver
        .wait(until.elementLocated(By.css('.aviso')),15000)

        let txtAviso
        do{
            txtAviso = await elementoAviso.getText()            
        }while(txtAviso === "")
        
        await driver.close()
        janelas = await driver.getAllWindowHandles()
        await driver.switchTo().window(janelas[1])
        await driver.close()
        janelas = await driver.getAllWindowHandles()        
        await driver.switchTo().window(janelas[0])

        return txtAviso
    }

    public async sairDosIframes(){
        await driver.switchTo().defaultContent()                        
        await driver.switchTo().defaultContent()
    }

    public async voltarParaSelecionarTurma(){
        await Util.aguardarAjax()
        console.log('voltarParaSelecionarTurma 1')
        await driver.findElement(By.css('.close > div:nth-child(1) > span:nth-child(2)')).click()
        console.log('voltarParaSelecionarTurma 2')      
    }



}


export default LancarConteudo