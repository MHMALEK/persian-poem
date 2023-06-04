import { Axios } from "axios";

const axios = require("axios");

class HttpClient {
  private client: Axios | undefined;
  constructor(baseURL: string) {
    this.client = this.create(baseURL);
  }
  private create(baseURL: string) {
    return axios.create({
      baseURL,
      timeout: 5000,
    });
  }
  getData = async (endpoint: string, params = {}, headers = {}) => {
    try {
      const response = await this.client?.get(endpoint, { params, headers });
      return response?.data;
    } catch (error) {
      return null;
    }
  };
}

export default HttpClient;
