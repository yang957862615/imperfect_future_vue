const isProdMode = Object.is(process.env.NODE_ENV, 'production');

module.exports = {
  baseURL: isProdMode ? 'http://118.25.49.151:9999/' : 'http://127.0.0.1:9999/'
};
