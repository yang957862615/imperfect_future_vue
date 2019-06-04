/**
 * axios插件配置
 */
import axios from 'axios';
import api from '~/api.config'
import {getToken} from "../utils/auth.js"

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
// 让ajax携带cookie
axios.defaults.withCredentials = true;
const Axios = axios.create({
  baseURL: api.baseURL
});

// 拦截器
Axios.interceptors.request.use(config => {
  const jwtToken = getToken();
  console.log('jwtToken:', jwtToken);
  jwtToken && (config.headers.Authorization = jwtToken);
  return config;
}, error => {
  return Promise.reject(error);
});

Axios.interceptors.response.use(response => {
  // 如果返回的状态码为200，说明接口请求成功，可以正常拿到数据
  // 否则的话抛出错误
  // console.log('response:', response);
  if (Object.is(response.status, 200) && Object.is(response.data.state, 200)) {
    return Promise.resolve(response);
  } else {
    return Promise.reject(response);
  }
}, error => {
  /*const {response} = error;
  if (response) {
    console.log('response.status:', response.status);
    switch (response.status) {
      // 后端拦截器如果发现没有token则返回此状态
      case 401:
        /!*router.push({
          path: '/auth/sign-in'
        });*!/
        break;
      default:
    }
  }*/
  // console.log('response.request:', error.response.request.path);
  return Promise.reject(error.response.status);
});

export default Axios;
