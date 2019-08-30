import Inicializar from '../Inicializar'
import ConexaoComBd from '../ConexaoComBd'
import DadosDoUsuario from '../DadosDoUsuario'
import LancarPresenca from '../LancarDiario/LancarPresenca'
import ExecuteLancarConteudo from './ExecuteLancarConteudo'


class ExecuteLancarPresenca{
    private bd = new ConexaoComBd()   
    private lancarPresenca = new LancarPresenca()

    public async iniciar(){        
        const usuariosComDiariosParaLancar = await this.bd.usuariosComDiariosParaLancar()
                
        if( usuariosComDiariosParaLancar.length !== 0 ){
            await Inicializar.iniciar()
            console.log('Carregando página inicial do SigEduca ...')

            for( let i = 0; i < usuariosComDiariosParaLancar.length; i++ ){

                //for para percorrer todos os usuários com diários para lançar

                let user = await this.bd.buscarCredenciaisDoUsuario(usuariosComDiariosParaLancar[i]._id)
                console.log(`Buscando dados para o ${i}º usuário ...`)

                DadosDoUsuario.loginSigEduca = user[i].loginSigEduca
                DadosDoUsuario.senhaSigEduca = user[i].senhaSigEduca

                console.log('Faça o login para o usuário informado...') 
                await Inicializar.logar()                              

                let diariosDoUsuario = await this.bd.diariosDePresencaDoUsuario(usuariosComDiariosParaLancar[i]._id)

                if(diariosDoUsuario.length !== 0 ){
                    await this.lancarPresenca.entrarEmLancarPresenca()
                    console.log('Entrando em lancar presença ...')
                }
                
                for( let j = 0; j< diariosDoUsuario.length; j++ ){ 
                    //for para percorrer todas as turmas com diários para lançar
                    
                   
                    console.log(`Selecionando a ${j}º turma ...`)
                    await this.lancarPresenca.selecionarTurma( diariosDoUsuario[j].codigoSerieAnoFaze,
                                                                diariosDoUsuario[j].numeroDoID)                       
                                                                    

                    await this.lancarPresenca.entrarNosIframes()

                      
                    for(let k = 0; k < diariosDoUsuario[j].diarios.length; k++){
                        //for para percorrer todos os diarios da turma

                        console.log(`Lancando presença para o ${k}º diário da ${j}º turma ...  `)

                        await this.lancarPresenca.selecionarDatas( diariosDoUsuario[j].diarios[k].data,
                                                                diariosDoUsuario[j].diarios[k].cargaHoraria)

                        await this.lancarPresenca.lancarPresenca( diariosDoUsuario[j].diarios[k].alunos,
                                                                diariosDoUsuario[j].diarios[k].cargaHoraria)

                        await this.lancarPresenca.clicarEmConfimarLancamentoDePresenca()

                        console.log(`Fim do lançamento de presença do ${k}º diário da ${j}º turma ...  `)

                        await this.bd.salvarDiarioSalvoNoSigEduca( diariosDoUsuario[j].diarios[k].data, 
                                                                diariosDoUsuario[j]._id )

                        console.log(`Diario de Presença salvo no SigEduca`)

                        let precisaDeAtualizacao = await this.lancarPresenca.precisaDeAtualizacao()
                        
                        if(precisaDeAtualizacao){
                            console.log('A turma precisa de atualizacao')
                            await this.bd.marcarPrecisaDeAtualizacaoComoTrue( diariosDoUsuario[j]._id )
                        }
                            
                    }  
                    await this.bd.marcarDiarioDePresencaDisponiveisComoFalse( diariosDoUsuario[j]._id )
                    console.log(`diarioDePresencaDisponiveis: false -- da ${j}º turma`)                  
                    await this.lancarPresenca.sairDosIframes()
                    await this.lancarPresenca.voltarParaSelecionarTurma() 
                    
                }
                console.log(`Iniciando o lançamento de conteúdo do ${i}º usuário`)                 
                await new ExecuteLancarConteudo().iniciar( usuariosComDiariosParaLancar[i]._id )
                console.log(`Fim do lançamento de conteúdo do ${i}º usuário`)  

                //await this.bd.marcarExistemDiariosParaLancarComoFalse( usuariosComDiariosParaLancar[i]._id )              
            }
        }else{
            console.log('Não existem diários para lançar')
        }
    }
}

new ExecuteLancarPresenca().iniciar()