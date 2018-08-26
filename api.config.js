const isProdMode = Object.is(process.env.NODE_ENV, 'prod');

module.exports = {
  baseURL: isProdMode ? 'https://rest.joegreens.cn/' : 'http://192.168.199.207:9999'
};
