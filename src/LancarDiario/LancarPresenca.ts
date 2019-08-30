import {driver} from '../Inicializar'
import { until, By, Key, Button, Origin } from 'selenium-webdriver';
import {DadosDoSistema} from '../DadosDoSistema';
import { Util } from '../util';
import { elementIsVisible } from 'selenium-webdriver/lib/until';
import entradaNoConsole from 'readline-sync'


class LancarPresenca {

    private existemAlunosQueNaoEstaoNoAgiliza = false

    public async entrarEmLancarPresenca(){
        try {
            
            await driver.wait(until.urlIs(DadosDoSistema.urlPaginaPrincipal), 10000)
            await driver.get(DadosDoSistema.urlLancarPresenca) 
            
        } catch (error) {
            console.log(error)
            throw {msg:'Erro no método entrarEmLancarPresenca em LancarPresenca.ts' , error}            
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

    public async selecionarDatas(data: string, cargaHoraria: number){ 
        await Util.aguardarAjax()
        await driver.wait(until.elementLocated(By.xpath("//input[@id='vDATAINI']"))).then(el => el.click())
        await driver.wait(until.elementLocated({ id: DadosDoSistema.idInputDatasIni })).sendKeys(data)

        await driver.wait(until.elementLocated(By.xpath("//input[@id='vDATAFIN']"))).then(el => el.click())
        await driver.wait(until.elementLocated({ id: DadosDoSistema.idInputDatasFim })).sendKeys(data)
        
        await driver.findElement(By.name(DadosDoSistema.nameBtnIncluir)).click()
        
        await Util.aguardarAjax()
        await driver.findElement({id: DadosDoSistema.idInputNumeroAulas}).sendKeys(cargaHoraria)
        await driver.findElement(By.name(DadosDoSistema.nameBtnAvancarDiario)).click()
    }

    public async lancarPresenca(alunos: any, cargaHoraria: number){
        await Util.aguardarAjax()
        try {
            let numeroDeAlunos = 0
            let elementoAlunoAtual
            do{
                numeroDeAlunos++
                let cont = await Util.formatarContador(numeroDeAlunos)
                let elementoDeControle = await driver.wait(until.elementLocated({id: 'W0074TEXTBLOCK7'}), 30000)
                await driver.wait(elementIsVisible(elementoDeControle))           
                
                elementoAlunoAtual = await driver.findElement(By.id('span_W0074vGEDALUNOM_AUX_00'+cont))
                                            .catch(() => {})  

                if(elementoAlunoAtual != undefined){
                    let txtAluno = await elementoAlunoAtual.getText()
                    let classNameAluno = await elementoAlunoAtual.getAttribute('class')                    
                    let objetoAluno = alunos.filter((aluno: any) => {
                        return aluno.nome === txtAluno
                    })
                    if(objetoAluno.length != 0 && objetoAluno[0].presenca){
                        for(let i=cargaHoraria;i>=1;i--){
                            let cargaHorariaFormated = await Util.formatarContador(i)  
                            console.log(`${txtAluno} : presente`)                     
                            await driver.findElement(By.name('W0074vDIA_00'+cargaHorariaFormated+'00'+cont)).click()
                        }
                    }else if(objetoAluno.length === 0 && classNameAluno !== "ReadonlyImage"){
                        console.log(`O aluno ${txtAluno} não está salvo no Agiliza Prof`)
                        this.existemAlunosQueNaoEstaoNoAgiliza = true
                        for(let i=cargaHoraria;i>=1;i--){
                            let cargaHorariaFormated = await Util.formatarContador(i)                   
                            await driver.findElement(By.name('W0074vDIA_00'+cargaHorariaFormated+'00'+cont)).click()
                        }
                    }else if(objetoAluno.length != 0 && !objetoAluno[0].presenca){
                        console.log(`${txtAluno} : faltou`)
                    }
                }               
                

            }while(elementoAlunoAtual != undefined) 
        } catch (error) {
            console.log(error)
            throw {msg: 'Erro no método lancarPresenca em LancarPresenca.ts', error}          
        }
    }

    public async precisaDeAtualizacao(){
        console.log('existemAlunosQueNaoEstaoNoAgiliza: '+ this.existemAlunosQueNaoEstaoNoAgiliza)
        return this.existemAlunosQueNaoEstaoNoAgiliza
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

    public async clicarEmConfimarLancamentoDePresenca(){
        await driver.findElement(By.name('BCONFIRMAR')).click()
    }

    
}


export default LancarPresenca