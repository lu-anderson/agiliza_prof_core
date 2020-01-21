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

            await this.lancarConteudo.selecionarBimestreAvaliacao('5')


            await this.lancarConteudo.lancarConteudo(diariosDeConteudo[i])  
            
            await this.lancarConteudo.clicarEmIncluir()

            await this.lancarConteudo.confirmarInclusao()

            await Util.aguardarAjax()

            let msgRetorno = await this.lancarConteudo.analisarMensagemDeRetorno()


            await diariosDeConteudo[i].diarioDeConteudo.forEach(async (element: any) => {
                await this.bd.salvarDiarioDeConteudoSalvoNoSigEduca(
                    element.data, diariosDeConteudo[i]._id, msgRetorno)
            })

            await this.bd.marcarDiarioDeConteudoDisponiveisComoFalse(diariosDeConteudo[i]._id)

           

            await this.lancarConteudo.sairDosIframes()

            await this.lancarConteudo.voltarParaSelecionarTurma()
        }
    }
}

export default ExecuteLancarConteudo
