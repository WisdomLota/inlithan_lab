import axios from "axios";

const API_URL = "http://localhost:5000/scores";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getLeaderboard = async () => {
  const res = await axios.get(`${API_URL}/leaderboard`, authHeader());
  return res.data;
};

export const refreshMyScore = async () => {
  const res = await axios.post(`${API_URL}/refresh`, {}, authHeader());
  return res.data;
};

export const getMyScore = async () => {
  const res = await axios.get(`${API_URL}/me`, authHeader());
  return res.data;
};