/**
 * 所有api集合
 */
import articleApi from './articleApi';
import commentApi from './commentApi';
import friendApi from './friendApi';
import messageApi from './messageApi';
import searchApi from './searchApi';
import userApi from './userApi';

const imperfectApi = {
  articleApi, commentApi, friendApi, messageApi, searchApi, userApi
};

export default imperfectApi;
