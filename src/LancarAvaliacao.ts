import {driver} from './Inicializar'
import { until, By } from 'selenium-webdriver';
import {DadosDoSistema} from './DadosDoSistema';
import { Util } from './util';
import ConexaoComBd from './ConexaoComBd'


class LancarAvaliacao{
    private bd = new ConexaoComBd()

    private async entrarEmLancarAvaliacao(){
        try {
            await driver.wait(until.urlIs(DadosDoSistema.urlPaginaPrincipal), 10000)
            await driver.get(DadosDoSistema.urlLancarAvaliacao) 
        } catch (error) {
            throw {msg:'Erro no método entrarEmLancarAvaliacao em LancarAvaliacao.ts' , error}            
        } 
    } 

    private async entrarNosFrames(){
            //Entrando no frame principal
            let iframe = await driver.wait(until.elementLocated({ className: 'GB_frame' }),10000)    
            await driver.switchTo().frame(iframe)

            //Entrando no frame secundário
            let iframe2 = await driver.wait(until.elementLocated({ id: 'GB_frame' }),10000)
            await driver.switchTo().frame(iframe2)
    }
    
    private async selecionarBimestreAvaliacao(bimestre:string) {
        try {  
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
            throw {msg:'Erro no método selecionarBimestreAvaliacao em LancarAvaliacao.ts', error }
        }
    }

    private async verificarSituacaoDoAluno(){         
        try {
            let situacaoDaMatricula = await driver.wait(until.elementLocated({id: DadosDoSistema.idSituacaoDaMatricula}),10000)
                                    .getText()        
            let alunoEspecial = await driver.wait(until.elementLocated({id: DadosDoSistema.idAlunoEspecial }),10000)
                                    .isDisplayed()
            let conceito = await driver.wait(until.elementLocated({id: DadosDoSistema.idConceito})).isDisplayed()

            if (situacaoDaMatricula == 'Transferido da Escola'){
                return 'Transferido da Escola'   
            }else if(situacaoDaMatricula == 'Matriculado'){
                if(!conceito){
                    return 'alunoAvaliado'
                }else if(alunoEspecial){      
                    return 'alunoEspecial'
                }else {
                    return 'alunoNormal'
                }
            } 
        } catch (error) {
            throw {msg:'Erro no método verificarSituacaoDoAluno em LancarAvaliacao.ts', error }
        } 
    } 

    private encontrarAlunoNoArray(alunos:any, aluno:any){
        for(let i = 0; i <= alunos.length; i++){
            if(alunos[i].aluno === aluno){
                return alunos[i]
            }
        }
    }

    private async clicarNoObjetivoASerAvaliado(numeroDoObjetivo:String, avaliacao:String){               
        await driver.findElement({name: 'vGRIDGEDAGRAVAPRMAVA'+avaliacao+'_00'+numeroDoObjetivo+'0001'}).click() 
    }

    private async clicarNoObjetivoNaoTrabalhado(numeroDoObjetivo:String, opcao: Number){
        await driver.findElement({name: 'vGRIDGEDAGRAVAPRMAVAONT_00'+numeroDoObjetivo+'0001'}).click()                    
        let el = await driver.findElement(By.xpath("//select[@id='vMOTIVOONT_00"+numeroDoObjetivo+ "0001']/option["+opcao+"]"))        
        await driver.wait(until.elementIsVisible(el)).click()          
    }

    private async clicarNoObjetivoTrabalharAnoPosterior(numeroDoObjetivo:String){
        await driver.findElement({name: 'vGRIDGEDAGRAVAPRMAVAOAP_00'+numeroDoObjetivo+'0001'}).click()  
    }



    private async clicarNosObjetivos(objetivos:any, aluno:any){        
        let objetoMedidasAdotadas = []        
        for(let i = 0; i<objetivos.length; i++){
            if(objetivos[i].estilo === 'bg-success'){
                let indexObjetivo = aluno.objetivosAvaliados.findIndex((obj:any) => obj.idNumeroDoObjetivo === objetivos[i].idNumeroDoObjetivo)
                await this.clicarNoObjetivoASerAvaliado(objetivos[i].idNumeroDoObjetivo, aluno.objetivosAvaliados[indexObjetivo].avaliacao)
                if(aluno.objetivosAvaliados[indexObjetivo].avaliacao === 'AB'){                    
                    objetoMedidasAdotadas.push({
                        textoDoObjetivo: objetivos[i].textoDoObjetivo,
                        medidasAdotadas: aluno.objetivosAvaliados[indexObjetivo].medidasAdotadas.medidasAdotadas,
                        resultadosObtidos: aluno.objetivosAvaliados[indexObjetivo].medidasAdotadas.resultadosObtidos,
                        satisfatoria: aluno.objetivosAvaliados[indexObjetivo].medidasAdotadas.satisfatoria
                    })
                }
            }else if (objetivos[i].estilo === 'bg-warning'){
                await this.clicarNoObjetivoNaoTrabalhado(objetivos[i].idNumeroDoObjetivo, 2)
            }else if(objetivos[i].estilo === 'bg-primary'){
                await this.clicarNoObjetivoNaoTrabalhado(objetivos[i].idNumeroDoObjetivo, 3)
            }else if(objetivos[i].estilo === 'bg-danger'){
                await this.clicarNoObjetivoNaoTrabalhado(objetivos[i].idNumeroDoObjetivo, 4)
            }else if(objetivos[i].estilo === 'bg-dark'){
                await this.clicarNoObjetivoNaoTrabalhado(objetivos[i].idNumeroDoObjetivo, 5)
            }else if(objetivos[i].estilo === 'bg-info'){
                await this.clicarNoObjetivoNaoTrabalhado(objetivos[i].idNumeroDoObjetivo, 6)
            }else if(objetivos[i].estilo === 'bg-secondary'){
                await this.clicarNoObjetivoTrabalharAnoPosterior(objetivos[i].idNumeroDoObjetivo)
            }
        }
        return objetoMedidasAdotadas
    }

    private async lancarMedidasAdotadas(objetoMedidasAdotadas:any){
        console.log('quantidade: ' + objetoMedidasAdotadas.length)
        console.log(objetoMedidasAdotadas)
        if(objetoMedidasAdotadas.length > 0){
            console.log('Existem objetivos com avaliação AB, insira as medidas adotadas!')
            await driver.findElement(By.id('vLANCAMENTOUNICO_0001')).click()                       
            await Util.aguardarAjax()
            await this.entrarNosFrames()           

            let ele = await driver.wait(until.elementLocated({ id: 'vACSAVAALUCAPMEDADT_0001'}),20000)
            await driver.wait(until.elementIsVisible(ele))    
            console.log('01')
            
            for(let i = 0; i<= objetoMedidasAdotadas.length-1; i++){
                let cont = await Util.formatarContador(i+1)                    
                let textoDoObjetivo = await driver.findElement({id: 'span_vGEDOBJAPRDSC_00'+cont}).getText()
                let index = objetoMedidasAdotadas.findIndex((elemento:any) => 
                    elemento.textoDoObjetivo === textoDoObjetivo )
                    console.log(index)                                    
                console.log(objetoMedidasAdotadas[index].satisfatoria)
                if(objetoMedidasAdotadas[index].satisfatoria === true){
                    let select
                    do{
                        select = await driver.findElement(By.name('vAVALIACAO_00'+cont)).isSelected()
                        await driver.findElement(By.name('vAVALIACAO_00'+cont)).click()                   
                    }
                    while(select === false)                  
                    await driver.findElement(By.name('vAVALIACAO_00'+cont)).click()
                    
                }else if(objetoMedidasAdotadas[index].satisfatoria === false){     
                    console.log('false')  
                    console.log('#TABLE4_00'+cont+' input:nth-child(2)')  
                    //await driver.findElement(By.css('#TABLE4_00'+cont+' input:nth-child(2)')).click()                               
                    let select
                    do{
                        select = await driver.findElement(By.css('#TABLE4_00'+cont+' input:nth-child(2)')).isSelected()
                        await driver.findElement(By.css('#TABLE4_00'+cont+' input:nth-child(2)')).click()                         
                    }
                    while(select === false)
                }                   
                console.log('02')
                await driver.findElement(By.css('#vACSAVAALUCAPMEDADT_00'+cont)).sendKeys(objetoMedidasAdotadas[index].medidasAdotadas)
                await driver.findElement(By.css('#vACSAVAALUCAPRESOBT_00'+cont)).sendKeys(objetoMedidasAdotadas[index].resultadosObtidos)
                console.log('03')
            }
            await driver.findElement(By.name('BTNCONFIRMAR')).click()           
            await Util.aguardarAjax()
            await driver.switchTo().defaultContent()
            await driver.switchTo().defaultContent()
            await driver.findElement(By.css('.close > div:nth-child(1) > span:nth-child(2)')).click()
            let el = await driver.wait(until.elementLocated({id: 'GB_overlay'}))
            await driver.wait(until.elementIsNotVisible(el))
        }
    }

    private async lancarParaTurma(turma: any){
        console.log(turma)
        await driver.findElement(By
            .css('#vGERMATCOD2 > option:nth-child('+turma.codigoSerieAnoFaze+')')).click()

        await Util.aguardarAjax()
        await driver.findElement(By.id(DadosDoSistema.idBtnLancarAvaliacaoDiario+ turma.numeroDoID)).click() 
        await this.entrarNosFrames()
        await this.selecionarBimestreAvaliacao('3')
       
        let situacaoDoAluno 
        let aluno
        let objetoAluno
        let objetoMedidasAdotadas
        console.log(turma.alunos.length)
        //turma.alunos.length
        for(let i = 0; i<=turma.alunos.length; i++){
            console.log(i)
            await Util.aguardarAjax()
            situacaoDoAluno = await this.verificarSituacaoDoAluno()    
            console.log(situacaoDoAluno)        
            switch(situacaoDoAluno){
                case 'Transferido da Escola':                        
                    await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()
                    break
                case 'alunoAvaliado':
                    await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()                   
                    break  
                case 'alunoEspecial':
                    console.log('aluno apto para ser avaliado na condição de aluno especial')                         
                    aluno = await  driver.wait(until.elementLocated({id: DadosDoSistema.idAluno}),10000).getText()
                    objetoAluno = this.encontrarAlunoNoArray(turma.alunos, aluno)
                    
                    objetoMedidasAdotadas = await this.clicarNosObjetivos(turma.objetivosDeAprendizagens, objetoAluno)
                    await this.lancarMedidasAdotadas(objetoMedidasAdotadas)

                    await driver.findElement({id: DadosDoSistema.idObservacoes}).sendKeys(objetoAluno.observacoes)                        
                    await driver.findElement({id: DadosDoSistema.idApoioPedagogico}).sendKeys(objetoAluno.apoioPedagogico)
                    await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()
                    break                    
                case 'alunoNormal':
                    console.log('Aluno apto para ser avaliado')                        
                    aluno = await  driver.wait(until.elementLocated({id: DadosDoSistema.idAluno}),10000).getText()
                    objetoAluno = this.encontrarAlunoNoArray(turma.alunos, aluno)

                    objetoMedidasAdotadas = await this.clicarNosObjetivos(turma.objetivosDeAprendizagens, objetoAluno)
                    await this.lancarMedidasAdotadas(objetoMedidasAdotadas)
                    
                    await driver.findElement(By.id(DadosDoSistema.idBtnProximoAluno)).click()               
                    break                
            }                                   
        }

        await Util.aguardarAjax()
        await driver.findElement(By.name('BUTTONVOLTAR_0001')).click()
        let guias = await driver.getAllWindowHandles()                        
        await driver.switchTo().window(guias[0])
        await driver.findElement(By.name('BUTTONCLOSE')).click()                       
        await driver.switchTo().defaultContent()                        
        await driver.switchTo().defaultContent()
    }


    public async start(turmas:any){
        console.log(turmas)
        console.log('test 03')
        await this.entrarEmLancarAvaliacao() 
        console.log('test 04')   
        for(let i = 0; i<= turmas.length; i++){
            await this.lancarParaTurma(turmas[i]) 
            await this.bd.registrarQueTurmaFoiAvaliadaNoSIg(turmas[i]._id)            
        }    
               
    }
}

export default LancarAvaliacao