export default {
    /**
     * 登录
     */
    loginUp() {
        return `/user/loginUp`;
    },
    /**
     * jwt里面的的用户信息
     */
    jwtUserInfo() {
        return `/user/userInfo`;
    },
    /**
     * 用户首页基本信息
     */
    basicUserInfo(userId) {
        return `/user/${userId}/userInfo`;
    },
    /**
     * 修改用户信息
     */
    modifyUserInfo() {
        return `/user/modify/userInfo`;
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
};