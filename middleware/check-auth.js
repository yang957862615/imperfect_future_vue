/**
 * 所有页面都已添加此中间件
 */

export default function ({store, req, app: {$cookies}}) {
	// If nuxt generate, pass this middleware
	if (process.server && !req) return;
	// 没有token不加载用户信息
	let token = $cookies.get('token');
	if (!token) return;
	// 已登录不加载用户信息
	if (store.getters.isAuthenticated) return;
	// 加载用户信息
	return store.dispatch('jwtUserInfo').catch(err => console.log('加载用户信息:', err));
}
