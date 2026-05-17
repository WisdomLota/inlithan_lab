import axios from "axios";

const API_URL = "http://localhost:5000/auth";

export const register = async (user) => {
  const res = await axios.post(`${API_URL}/register`, user);
  return res.data;
};

export const login = async (credentials) => {
  const res = await axios.post(`${API_URL}/login`, credentials);
  return res.data;
};

export const logout = async () => {
  const res = await axios.post(`${API_URL}/logout`);
  return res.data;
};