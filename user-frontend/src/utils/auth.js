export const getToken = () =>
  localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");