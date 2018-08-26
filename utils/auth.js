import Cookie from 'js-cookie';

export const setToken = (token) => {
  if (process.SERVER_BUILD) return;
  Cookie.set("token", token);
};

export const unsetToken = () => {
  if (process.SERVER_BUILD) return;
  Cookie.remove("token");
};

export const getToken = () => {
  return Cookie.get("token") || null;
};
