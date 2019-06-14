import api from './services/api'


class ConexaoComBd{
    public async buscarUser(user:string){
       
        try {
            const response = await api.post('/authenticate',{
                loginSigEduca: user
            })                   
            return response.data.user
        } catch (error) {           
            console.log(error.response.data.error)
        }
    }

    public async salvarTurmas(turmas:any,userId:string){
        try {
            const response = await api.post(`/addTurmas/${userId}`, {
                turmas: turmas
            })
            console.log(response.data)
        } catch (error) {
            console.log(error.response.data.error)
        }
    }
}


export default ConexaoComBd