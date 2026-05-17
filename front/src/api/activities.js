import axios from "axios";

const API_URL = "http://localhost:5000/activities";

export const getActivities = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createActivity = async (activity) => {
  const res = await axios.post(API_URL, activity);
  return res.data;
};