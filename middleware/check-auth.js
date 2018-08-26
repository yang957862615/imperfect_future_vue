/**
 * 所有页面都已添加此中间件
 */
import {getToken} from '~/utils/auth.js'

export default function ({isServer, store, req, route}) {
  // If nuxt generate, pass this middleware
  if (isServer && !req) return;
  if (!getToken() || getToken() == null) return; // 没有token不加载用户信息
  if (store.getters.isAuthenticated) return; // 已登录不加载用户信息
  store.dispatch("redisUserInfo").catch(err => console.log('err:', err)); // 加载用户信息
}
