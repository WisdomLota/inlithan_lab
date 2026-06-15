import axios from "axios";

const API_URL = "http://localhost:5000/search";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const globalSearch = async (q) => {
  const res = await axios.get(`${API_URL}?q=${encodeURIComponent(q)}`, authHeader());
  return res.data;
};