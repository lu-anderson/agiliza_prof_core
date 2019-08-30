import Inicializar, {driver, By} from '../Inicializar'
import ConexaoComBd from '../ConexaoComBd'
import DadosDoUsuario from '../DadosDoUsuario'
import LancarConteudo from '../LancarDiario/LancarConteudo'
import { Util } from '../util';
import { until } from 'selenium-webdriver';
import { DadosDoSistema, DadosSistemaLancarConteudo } from '../DadosDoSistema';


class ExecuteLancarConteudo{
    private lancarConteudo = new LancarConteudo()
    private bd = new ConexaoComBd()

    public async iniciar(id: string){       

        let diariosDeConteudo = await this.bd.diariosDeConteudoDoUsuario(id)

        if(diariosDeConteudo.length !== 0 ){
            await this.lancarConteudo.entrarEmLancarConteudo()
        }

        for(let i = 0; i < diariosDeConteudo.length; i++){            

            console.log(`Selecionando a ${i}º turma para lançar conteúdo...`)

            await this.lancarConteudo.selecionarTurma( diariosDeConteudo[i].codigoSerieAnoFaze,
                                             diariosDeConteudo[i].numeroDoID)

            await this.lancarConteudo.entrarNosIframes()

            await this.lancarConteudo.selecionarBimestreAvaliacao('3')

            for(let j = 0; j < diariosDeConteudo[i].diarioDeConteudo.length; j++){
                if(j%2 === 0){
                    let contadorFormatado = await Util.formatarContador(j+1)
                    await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDTA_000100${contadorFormatado}`)),15000)
                    .sendKeys(diariosDeConteudo[i].diarioDeConteudo[j].data)
                    console.log(`vGGEDCONPROGDTA_000100${contadorFormatado}`)
                    await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDSC_000100${contadorFormatado}`)),15000)
                    .sendKeys(diariosDeConteudo[i].diarioDeConteudo[j].conteudo.texto)
                }

                if(j%2 === 1){
                    let contadorFormatado = await Util.formatarContador(j)
                    await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDTA_000200${contadorFormatado}`)),15000)
                    .sendKeys(diariosDeConteudo[i].diarioDeConteudo[j].data)
                    await driver.wait(until.elementLocated(By.id(`vGGEDCONPROGDSC_000200${contadorFormatado}`)),15000)
                    .sendKeys(diariosDeConteudo[i].diarioDeConteudo[j].conteudo.texto)
                }
            }            
        }
    }
}

export default ExecuteLancarConteudo
