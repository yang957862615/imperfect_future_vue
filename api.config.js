const isProdMode = Object.is(process.env.NODE_ENV, 'production');

const apiBaseURL = isProdMode ? 'https://api.joegreens.cn:31004/' : 'http://api.joegreens.cn:31004/';

export default apiBaseURL;
