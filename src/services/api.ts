import axios from 'axios'

var onLine = 'http://agiliza-com-br.umbler.net/'
var offLine = 'http://localhost:3000'
const api = axios.create({
    baseURL: offLine
})

export default api