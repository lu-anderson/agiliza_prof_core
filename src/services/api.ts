import axios from 'axios'

var onLine = 'https://www.agilizaon.com.br'
var offLine = 'http://localhost:3000'
const api = axios.create({
    baseURL: offLine
})

export default api