const isProdMode = Object.is(process.env.NODE_ENV, 'production');

module.exports = {
  baseURL: isProdMode ? 'https://api.joegreens.cn:9999/' : 'http://127.0.0.1:9999/'
};
