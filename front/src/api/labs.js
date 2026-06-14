import axios from "axios";

const API_URL = "http://localhost:5000/labs";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getSessions = async () => {
  const res = await axios.get(`${API_URL}/sessions`, authHeader());
  return res.data;
};

export const getSession = async (id) => {
  const res = await axios.get(`${API_URL}/sessions/${id}`, authHeader());
  return res.data;
};

export const createSession = async (mode) => {
  const res = await axios.post(`${API_URL}/sessions`, { mode }, authHeader());
  return res.data;
};

export const deleteSession = async (id) => {
  const res = await axios.delete(`${API_URL}/sessions/${id}`, authHeader());
  return res.data;
};

export const sendMessage = async (sessionId, text) => {
  const res = await axios.post(`${API_URL}/sessions/${sessionId}/message`, { text }, authHeader());
  return res.data;
};