import {getToken} from "../utils/auth";

export default function ({$axios, redirect}) {
  /*$axios.onRequest(config => {
    console.log('Making request to ' + config.url)
    return Promise.resolve();
  });
*/
  $axios.onResponse(response => {
    const code = parseInt(response && response.data.state);
    if (code !== 200) {
      return Promise.reject(response.data.info);
    }
  });
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    if (code === 401) {
      redirect('/auth/sign-in')
    }
  });

  // Adds header: `Content-Type: application/x-www-form-urlencoded` to only post requests
  $axios.setHeader('Content-Type', 'application/x-www-form-urlencoded', [
    'post'
  ]);

  $axios.setHeader('Authorization', !!getToken() ? 'Bearer ' + getToken() : '');
}
