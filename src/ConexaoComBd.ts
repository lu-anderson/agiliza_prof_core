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
            await api.put(`/addTurmas/${userId}`, {
                turmas: turmas
            })            
        } catch (error) {            
            console.log('Erro ao salvarTurmas em ConexaoComBd.ts') 
            console.log(error.response.data.error)
        }
    }

    public async userSemDados(){
        try {
            const response = await api.get('/usersSemDados')
            return response.data
        } catch (error) {
            console.log(error.response.data.error)
        }
    }

}


export default ConexaoComBd