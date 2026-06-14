import axios from "axios";

const API_URL = "http://localhost:5000/users";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getMe = async () => {
  const res = await axios.get(`${API_URL}/me`, authHeader());
  return res.data;
};

export const updateMe = async (updates) => {
  const res = await axios.put(`${API_URL}/me`, updates, authHeader());
  return res.data;
};