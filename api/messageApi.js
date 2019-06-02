const messageApi = {
  /**
   * 用户没有在线时的消息
   */
  userNotOnlineMsgs(userId) {
    return `/message/${userId}/userNotOnlineMsgs`;
  },
  /**
   * 系统消息
   */
  sysMessages(userId, pageNo) {
    if (!!pageNo) {
      return `/message/${userId}/sys?pageNo=${pageNo}`;
    }
    return `/message/${userId}/sys`;
  },
  /**
   * 订阅消息
   */
  subMessages(userId, pageNo) {
    if (!!pageNo) {
      return `/message/${userId}/sub?pageNo=${pageNo}`;
    }
    return `/message/${userId}/sub`;
  }
};

export default messageApi;
