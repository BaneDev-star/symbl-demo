import axios from 'axios'

export default class API {
  static async onSpeech(data) {
    return await axios.post(`${process.env.REACT_APP_SERVER_URL}/speech`, data)
  }
}