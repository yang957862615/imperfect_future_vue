/**
 * 需要登录才能访问的页面需要手动添加此中间件
 */
export default function ({req, store, redirect, route}) {
  if (!store.getters.isAuthenticated) { // 没有登录则跳转到登录页面
    redirect(`/auth/sign-in?redirect=${route.path}`)
  }
}
