import {getToken} from '../utils/auth';

export default function ({$axios, redirect}) {

	$axios.onResponse(response => {
		const code = parseInt(response && response.data.state);
		if (code !== 200) {
			// 这里报错后会流转到$axios.onError方法
			let reason = {response: {status: code, statusText: response.data.info}};
			return Promise.reject(reason);
		}
	});

	$axios.onError(error => {
		const code = parseInt(error.response && error.response.status);
		if (code === 401) {
			redirect('/auth/sign-in');
		}
		return Promise.reject(error.response);
	});

	// Adds header: `Content-Type: application/x-www-form-urlencoded` to only post requests
	$axios.setHeader('Content-Type', 'application/x-www-form-urlencoded', [
		'post'
	]);

	$axios.setHeader('Authorization', !!getToken() ? 'Bearer ' + getToken() : '');
}
