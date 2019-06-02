const userApi = {
  /**
   * 登录
   */
  loginUp() {
    return `/user/loginUp`;
  },
  /**
   * 注销
   */
  loginOut(token) {
    return `/user/loginOut/${token}`;
  },
  /**
   * redis里面的的用户信息
   */
  redisUserInfo(token) {
    return `/user/redis/${token}`;
  },
  /**
   * 用户首页基本信息
   */
  basicUserInfo(userId) {
    return `/user/${userId}/userInfo`;
  },
};

export default userApi;
