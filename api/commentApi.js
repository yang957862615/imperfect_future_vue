export default {
    /**
     * 用户发送的评论
     */
    userSentComments(userId, pageNo) {
        if (!!pageNo) {
            return `/message/${userId}/userSentComments?pageNo=${pageNo}`;
        }
        return `/message/${userId}/userSentComments`;
    },
    /**
     * 用户收到的的评论
     */
    userReceivedComments(userId, pageNo) {
        if (!!pageNo) {
            return `/message/${userId}/userReceivedComments?pageNo=${pageNo}`;
        }
        return `/message/${userId}/userReceivedComments`;
    },
    /**
     * 加载文章评论
     */
    articleComments(articleId, pageNo) {
        return `/comment/all?articleId=${articleId}&pageNo=${pageNo}`;
    }
};
