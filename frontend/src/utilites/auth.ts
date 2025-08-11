export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};