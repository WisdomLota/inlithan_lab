import axios from "axios";

const API_URL = "http://localhost:5000/research";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getCurrentResearchPaper = async () => {
  const res = await axios.get(`${API_URL}/current`, authHeader());
  return res.data;
};