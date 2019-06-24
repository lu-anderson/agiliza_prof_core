import {driver} from './Inicializar'
import { until, By } from 'selenium-webdriver';
import DadosDoSistema from './DadosDoSistema';
import { Util } from './util';


class BuscarDadosNoSig{
    private async entrarEmLancarAvaliacao(){
        try {
            await driver.wait(until.urlIs(DadosDoSistema.urlPaginaPrincipal), 10000)
            await driver.get(DadosDoSistema.urlLancarAvaliacao) 
        } catch (error) {
            throw {msg:'Erro no método entrarEmLancarAvaliacao em BuscarDadosNoSig.ts' , error}            
        } 
    } 
    
    private async selecionarBimestreAvaliacao(bimestre:string) {
        try {
            //Entrando no frame principal
            let iframe = await driver.wait(until.elementLocated({ className: 'GB_frame' }),10000)    
            await driver.switchTo().frame(iframe)

            //Entrando no frame secundário
            let iframe2 = await driver.wait(until.elementLocated({ id: 'GB_frame' }),10000)
            await driver.switchTo().frame(iframe2)

            //Selecinando o bimestre        
            let inputBimestre = await driver.wait(until.elementLocated({ id: DadosDoSistema.idInputBimestre }),10000)
            await driver.wait(until.elementIsVisible(inputBimestre), 10000)
            
            await driver.findElement(By.xpath("//select[@id='"+DadosDoSistema.idInputBimestre+"']/option["+ bimestre + "]"))
                .click()       
            
            await Util.aguardarAjax()        
            
            let elementoBtnLancarAvaliacao2 = await driver.wait(
                                                until.elementLocated(By.name(DadosDoSistema.nameBtnLancarAvaliacao2)),10000)
            await elementoBtnLancarAvaliacao2.click()
            
            let guias
            do {
                guias = await driver.getAllWindowHandles()            
                if(guias.length != 2){
                    await elementoBtnLancarAvaliacao2.click()
                    guias = await driver.getAllWindowHandles() 
                }                      
            } while(guias.length == 1);  
            await driver.switchTo().window(guias[1])
        } catch (error) {
            throw {msg:'Erro no método selecionarBimestreAvaliacao em BuscarDadosNoSig.ts', error }
        }
    }

    private async identificarNumeroDeAlunos(){
        try {
            let txtNumeroDeAlunos = await driver.findElement({id: DadosDoSistema.idNumeroDeAlunos}).getText()
            let numeroDeAlunos = parseInt(txtNumeroDeAlunos)
            return numeroDeAlunos            
        } catch (error) {
            throw {msg:'Erro no método identificarNumeroDeAlunos em BuscarDadosNoSig.ts' , error}
        }        
    }

    private identificarAluno = async() =>{  
        try {
            let aluno = await  driver.wait(until.elementLocated({id: DadosDoSistema.idAluno}),10000).getText()
         return aluno
        } catch (error) {
            throw {msg: 'Erro no método identificarAluno em BuscarDadosNoSig.ts', error}
        }  
    }

    private async verificarSituacaoDoAluno(){         
        try {
            let situacaoDaMatricula = await driver.wait(until.elementLocated({id: DadosDoSistema.idSituacaoDaMatricula}),10000)
                                    .getText()        
            let alunoEspecial = await driver.wait(until.elementLocated({id: DadosDoSistema.idAlunoEspecial }),10000)
                                        .isDisplayed()            
            if (situacaoDaMatricula == 'Transferido da Escola'){
                return 'Transferido da Escola'   
            }else if(situacaoDaMatricula == 'Matriculado'){
                if(alunoEspecial){      
                    return 'alunoEspecial'                 
                }else{
                    return 'alunoNormal'                
                }
            } 
        } catch (error) {
            throw {msg:'Erro no método verificarSituacaoDoAluno em BuscarDadosNoSig.ts', error }
        } 
    }     

    private async identificarAlunosPorturma(){ 
        try {
            await Util.aguardarAjax()
            let numeroDeAlunos = await this.identificarNumeroDeAlunos()        
            let alunos = []        
            for(let i = 1; i<=2; i++){
                let situacaoDoAluno = await this.verificarSituacaoDoAluno()
                let aluno = await this.identificarAluno()  
                switch(situacaoDoAluno){
                    case 'Transferido da Escola':                       
                        await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()
                        break                                  
                    case 'alunoEspecial':                   
                        alunos.push({aluno, alunoEspecial: true}) 
                        await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()                    
                        break              
                    case 'alunoNormal':                                    
                        alunos.push({aluno}) 
                        await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()                    
                        break                        
                }            
                await Util.aguardarAjax()
            }         
            return alunos  
        } catch (error) {
            throw {msg:'Erro no método identificarAlunosPorturma em BuscarDadosNoSig.ts', error }
        }     
    }

    private async identificarObjetivos(){
        try {
            let numeroDeObjetivos = 0
            let condicaoParaSairDoWhile
            let objetivos = []
            do{
                numeroDeObjetivos++
                let cont = await Util.formatarContador(numeroDeObjetivos)
                condicaoParaSairDoWhile = await driver.findElement(By.id(DadosDoSistema.idCodigoObjetivo+cont+'0001'))
                                            .catch(() => {})           

                if(condicaoParaSairDoWhile != undefined){
                    let codigoDoObjetivo = await driver.findElement(By.id(DadosDoSistema.idCodigoObjetivo+cont+'0001'))
                                            .getText()  
                    let textoDoObjetivo = await driver.findElement(By.id(DadosDoSistema.idTextoDoObjetivo+cont+'0001'))
                                            .getText()
                    objetivos.push({
                        codigoDoObjetivo: codigoDoObjetivo,
                        textoDoObjetivo: textoDoObjetivo
                    })
                }            
            }while(condicaoParaSairDoWhile != undefined)        
            return objetivos  
        } catch (error) {
            throw {msg: 'Erro no método identificarObjetivos em BuscarDadosNoSig.ts', error}          
        }
    }   

    private async buscarTurmas(escola:string){
        try {
            await this.entrarEmLancarAvaliacao()        
            let contadorDeSerieAnoFase = 2 
            let elementoSerieAnoFase 
            let turma       
            let turmas = []
                    
            do{            
                elementoSerieAnoFase = await driver.findElement(By
                                        .css('#vGERMATCOD2 > option:nth-child('+contadorDeSerieAnoFase+')')).catch(() => {})            
                
                if(elementoSerieAnoFase != undefined){                
                    //Existe um elemento que fica impedindo de clicar em 'elementoSerieAnoFase', isso trata esse problema.
                    let elemento = await driver.findElement(By.id('GB_overlay')).catch(() => {})
                    if(elemento != undefined){
                        await driver.wait(until.stalenessOf(elemento), 10000)
                    } 
                                             
                    await elementoSerieAnoFase.click()                
                    await Util.aguardarAjax()
                    let contador  = 1                             
                    do {                    
                        let contadorFormatado = await Util.formatarContador(contador)              
                        turma = await driver.findElement(By.id(DadosDoSistema.idBtnLancarAvaliacaoDiario + contadorFormatado))
                                .catch(() => {})                             
                        
                        if(turma != undefined){
                            //Existe um elemento que fica impedindo de clicar em 'elementoSerieAnoFase', isso trata esse problema.
                            let elemento = await driver.findElement(By.id('GB_overlay')).catch(() => {})
                            if(elemento != undefined){
                                await driver.wait(until.stalenessOf(elemento), 10000)
                            }
                            
                            let textoDisciplina = await driver.findElement(By
                                    .id(DadosDoSistema.idDisciplinaNaArea + contadorFormatado)).getText()
    
                            let textoSerieAnoFase = await driver.findElement(By
                                    .id(DadosDoSistema.idTextoSerieAnoFase + contadorFormatado)).getText()
    
                            let textoTurma = await driver.findElement(By
                                .id(DadosDoSistema.idTextoTurma + contadorFormatado)).getText()                       
                            
                            await driver.findElement(By.id(DadosDoSistema.idBtnLancarAvaliacaoDiario+ contadorFormatado)).click() 
                            await this.selecionarBimestreAvaliacao('2')  
                            await Util.aguardarAjax()   
                            let objetivos = await this.identificarObjetivos()                                       
                            let alunos = await this.identificarAlunosPorturma()                        
                            await Util.aguardarAjax()
    
                            await driver.findElement(By.name('BUTTONVOLTAR_0001')).click()
                            let guias = await driver.getAllWindowHandles()                        
                            await driver.switchTo().window(guias[0])
                            await driver.findElement(By.name('BUTTONCLOSE')).click()                       
                            await driver.switchTo().defaultContent()                        
                            await driver.switchTo().defaultContent()
                            
                              
                            turmas.push({escola, codigoSerieAnoFaze: contadorDeSerieAnoFase, serieAnoFase: textoSerieAnoFase, disciplina: textoDisciplina, 
                                            turma: textoTurma, numeroDoID: contadorFormatado, alunos, objetivosDeAprendizagens: objetivos})  
                            contador++                        
                        }
                    }while (turma != undefined); 
                }
                contadorDeSerieAnoFase++
            }while(elementoSerieAnoFase != undefined) 
    
            await driver.get(DadosDoSistema.urlPaginaPrincipal)
            return turmas 
        } catch (error) {
            throw {msg: 'Erro no método buscarTurmas em BuscarDadosNoSig.ts', error}            
        }       
    }

    public async iniciar(escolas:any){        
        try {
            let quantidadeDeEscolas = escolas.length
            console.log(quantidadeDeEscolas)
            let cont = 0
            let turmas:any = []        
            if(quantidadeDeEscolas !== 1){
                while(cont < quantidadeDeEscolas){                     
                    await driver.get(DadosDoSistema.urlSelecionarLotacao)                    
                    await driver.findElement(By.id(DadosDoSistema.idInputLotacao)).sendKeys(escolas[cont])                    
                    await driver.findElement(By.name(DadosDoSistema.nameBtnAtualizarLotacao)).click()                    
                    await Util.aguardarAjax()                    
                    await driver.findElement(By.id(DadosDoSistema.idCodigoLotacao)).click()                    
                    await Util.aguardarAjax()                 
                    let turma = await this.buscarTurmas(escolas[cont])   
                    turmas = await turmas.concat(turma)                
                    cont++
                }                     
            }else{
                turmas = await this.buscarTurmas(escolas[0])
            }
            return turmas
        } catch (error) {
            throw {msg: 'Erro no método start em BuscarDadosNoSig.ts', error}
        }
    }
}

export default BuscarDadosNoSig
