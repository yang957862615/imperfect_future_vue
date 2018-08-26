/**
 * axios插件配置
 */
import axios from 'axios';
import api from '~/api.config';

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// 让ajax携带cookie
axios.defaults.withCredentials = true;
const Axios = axios.create({
  baseURL: api.baseURL
});

// 拦截器
Axios.interceptors.request.use(config => {
  return config;
}, error => {
  // 在一个promise链中，只要任何一个promise被reject，promise链就被破坏了，
  // reject之后的promise都不会再执行，而是直接调用.catch方法
  // 一定要在最后加上 .catch 的原因。通过 .catch 能够清楚的判断出promise链在哪个环节出了问题。
  return Promise.reject(error);
});

Axios.interceptors.response.use(config => {
  return config;
}, error => {
  return Promise.reject(error);
});

export default Axios;
