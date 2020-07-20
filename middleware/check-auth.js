/**
 * 所有页面都已添加此中间件
 */
import {getToken} from '~/utils/auth'

export default function ({store, req}) {
  // If nuxt generate, pass this middleware
  if (process.server && !req) return;
  // 没有token不加载用户信息
  if (!getToken() || getToken() == null) return;
  // 已登录不加载用户信息
  if (store.getters.isAuthenticated) return;
  // 加载用户信息
  store.dispatch('jwtUserInfo');
}
