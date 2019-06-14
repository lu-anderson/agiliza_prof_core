import axios from 'axios'

const api = axios.create({
    baseURL: 'http://agiliza-com-br.umbler.net/'
})

export default api