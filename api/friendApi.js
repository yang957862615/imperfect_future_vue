const friendApi = {
  /**
   * 是否关注
   */
  ifFriend(userId, followedId) {
    return `/friend/${userId}/${followedId}`;
  },
  /**
   * 关注用户
   */
  follow() {
    return `/friend/subscribe`;
  },
  /**
   * 取消关注
   */
  unFollow() {
    return `/friend/unsubscribe`;
  }
};

export default friendApi;
