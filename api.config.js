const isProdMode = Object.is(process.env.NODE_ENV, 'production');

const apiBaseURL = isProdMode ? 'https://api.joegreens.cn/' : 'http://localhost:8001/';

export default apiBaseURL;
