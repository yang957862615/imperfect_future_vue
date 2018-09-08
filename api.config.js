const isProdMode = Object.is(process.env.NODE_ENV, 'production');

module.exports = {
  baseURL: isProdMode ? 'https://api.joegreens.cn/' : 'http://0.0.0.0:9999/'
};
