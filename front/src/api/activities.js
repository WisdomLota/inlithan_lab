import axios from "axios";

const API_URL = "http://localhost:5000/activities";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getActivities = async () => {
  const res = await axios.get(API_URL, authHeader());
  return res.data;
};

export const createActivity = async (activity) => {
  const res = await axios.post(API_URL, activity, authHeader());
  return res.data;
};

export const updateActivity = async (id, updates) => {
  const res = await axios.put(`${API_URL}/${id}`, updates, authHeader());
  return res.data;
};

export const deleteActivity = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, authHeader());
  return res.data;
};

export const submitActivity = async (id, payload) => {
  const res = await axios.post(`${API_URL}/${id}/submit`, payload, authHeader());
  return res.data;
};