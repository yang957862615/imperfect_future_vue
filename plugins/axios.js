export default function ({redirect, app: {$axios, $cookies}}) {
	$axios.onResponse(response => {
		const code = parseInt(response && response.data.state);
		if (code !== 200) {
			return Promise.reject(response.data.info);
		}
	});
	$axios.onError(error => {
		const code = parseInt(error.response && error.response.status);
		if (code === 401) {
			redirect('/auth/sign-in');
		}
	});

	// Adds header: `Content-Type: application/x-www-form-urlencoded` to only post requests
	$axios.setHeader('Content-Type', 'application/x-www-form-urlencoded', [
		'post'
	]);

	// TODO 刷新页面获取不到cookie
	let token = $cookies.get('token');
	$axios.setHeader('Authorization', !!token ? `Bearer ${token}` : '');
}
