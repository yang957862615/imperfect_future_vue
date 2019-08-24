export default {
    search(keywords, pageNo) {
        return `/search/article?searchWords=${keywords}&pageNo=${pageNo}`;
    }
};
