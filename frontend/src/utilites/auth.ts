export const logout = () => {
  localStorage.removeItem("token");
};

export const logoutAndRedirect = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const isLoggedIn = () => !!localStorage.getItem("token");

export const getToken = () => localStorage.getItem("token");
