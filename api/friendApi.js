const friendApi = {
  /**
   * 是否关注
   */
  ifFriend(userId, followedId) {
    return `/friend/${userId}/${followedId}`;
  },
  /**
   * 已经关注的人
   */
  friends(userId, pageNo) {
    if (!!pageNo) {
      return `/user/userFollowedUsers?userId=${userId}&pageNo=${pageNo}`;
    }
    return `/user/userFollowedUsers?userId=${userId}`;
  },
  /**
   * 关注用户
   */
  follow() {
    return `/follow/subscribe`;
  },
  /**
   * 取消关注
   */
  unFollow() {
    return `/follow/unsubscribe`;
  }
};

export default friendApi;
