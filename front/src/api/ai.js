import axios from "axios";

const API_URL = "http://localhost:5000/ai";

export const generateActivity = async (prompt, type) => {
  const res = await axios.post(`${API_URL}/generate`, { prompt, type });
  return res.data;
};