import axios from 'axios';

export const axiosInstance = axios.create({
  // baseURL: `https://neat-salmon-jooyeon-c3c36dcb.koyeb.app/`,
  baseURL: `http://localhost:3001`,
});
