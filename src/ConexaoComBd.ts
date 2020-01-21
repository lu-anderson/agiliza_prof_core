import api from './services/api'

class ConexaoComBd{
    public async buscarUser(user:string){       
        try {
            const response = await api.post('/authenticate',{
                loginSigEduca: user
            })                   
            return response.data.user
        } catch (error) {
            throw {msg: error.response.data.error, error, log:'Erro ao buscarUser em ConexaoComBd.ts'}             
        }
    }

    public async salvarTurmas(turmas:any,userId:string){
        try {
            await api.put(`auth/addTurmas/${userId}`, {
                turmas: turmas
            })            
        } catch (error) {            
            console.log('Erro ao salvarTurmas em ConexaoComBd.ts') 
            console.log(error.response.data.error)
        }
    }

    public async salvarNewTurmas(turmas:any,userId:string){
        try {
            await api.put(`core/addNewTurmas/${userId}`, {
                turmas: turmas
            })            
        } catch (error) {            
            console.log('Erro ao salvarNewTurmas em ConexaoComBd.ts') 
            console.log(error)
        }
    }

    public async usersComAlteracao(){
        try {
            const response = await api.get('core/usersComAlteracao')
            return response.data
        } catch (error) {
            console.log(error.response.data.error)
        }
    }

    public async turmasComAlteracao(userId:string){
        try {
            const response = await api.get(`core/turmas/ComAlteracao/${userId}`)
            console.log(response.data)
            return response.data
        } catch (error) {
            console.log(error.response.data.error)
        }
    }

    public async userSemDados(){
        try {
            const response = await api.get('auth/usersSemDados')
            return response.data
        } catch (error) {
            console.log(error.response.data.error)
        }
    }

    public async registrarQueTurmaFoiAvaliadaNoSIg(turmaId: string){
        try {
            const response = await api.put(`/registrarQueTurmaFoiAvaliadaNoSig/${turmaId}`)
            return response
        } catch (error) {
            console.log(error)
        }
    }
    
    public async usuariosComDiariosParaLancar(){
        try{
            const response = await api.get('/core/users/diariosParaLancar')
            return response.data
        }catch(error){
            console.log(error)
        }
    }

    public async diariosDePresencaDoUsuario(id:string){
        try{
            const response = await api.get(`core/turmas/diariosDePresencaNaoSalvos/${id}`)
            return response.data
        }catch(error){
            console.log(error)
        }
    }

    public async diariosDeConteudoDoUsuario(id: string){
        try {
            const response = await api.get(`core/turmas/diariosDeConteudosNaoSalvos/${id}`)
            return response.data
        } catch (error) {
            console.log(error)
        }
    }

    public async buscarCredenciaisDoUsuario(id: string){
        try{
            const response = await api.get(`core/users/${id}`)
            return response.data
        }catch(error){
            console.log(error)
        }

    }

    public async salvarDiarioDePresensaSalvoNoSigEduca(data: string, turmaId: string){
        try {
            await api.put('/core/turmas/diarioDePresencaSalvoNoSigEduca', {
                data,
                turmaId
            })
        } catch (error) {
            console.log(error)
        }
    }

    public async salvarDiarioDeConteudoSalvoNoSigEduca(data: string, turmaId: string, msgRetorno: string){
        try {
            await api.put('/core/turmas/diarioDeConteudoSalvoNoSigEduca', {
                data,
                turmaId,
                msgRetorno, 
            })
        } catch (error) {
            console.log(error)
        }
    }

    public async marcarPrecisaDeAtualizacaoComoTrue(turmaId: string){
        try {
            await api.put('/core/turmas/precisaDeAtualizacao', {
                turmaId
            })
        } catch (error) {
            console.log(error)
        }
    }


    public async marcarExistemDiariosParaLancarComoFalse(id:string){
        try {
            await api.put(`core/users/diariosSalvos/${id}`)
        } catch (error) {
            console.log(error)
        }
    }

    public async marcarDiarioDePresencaDisponiveisComoFalse(id:string){
        try {
            await api.put(`core/turmas/diariosDePresencaDisponiveis/${id}`)
        } catch (error) {
            console.log(error)
        }
    }

    public async marcarDiarioDeConteudoDisponiveisComoFalse(id:string){
        try {
            await api.put(`core/turmas/diariosDeConteudoDisponiveis/${id}`)
        } catch (error) {
            console.log(error)
        }
    }
    

}


export default ConexaoComBd