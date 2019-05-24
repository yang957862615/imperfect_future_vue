const isProdMode = Object.is(process.env.NODE_ENV, 'production');

module.exports = {
  baseURL: isProdMode ? 'https://api.joegreens.cn/' : 'http://localhost:8001/'
};
