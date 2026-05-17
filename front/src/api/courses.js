import axios from "axios";

const API_URL = "http://localhost:5000/courses";

export const getCourses = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createCourse = async (course) => {
  const res = await axios.post(API_URL, course);
  return res.data;
};