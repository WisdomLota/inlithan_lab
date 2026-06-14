import axios from "axios";

const API_URL = "http://localhost:5000/courses";

function authHeader() {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
}

export const getCourses = async () => {
  const res = await axios.get(API_URL, authHeader());
  return res.data;
};

export const getExploreCourses = async () => {
  const res = await axios.get(`${API_URL}/explore`, authHeader());
  return res.data;
};

export const getCourse = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`, authHeader());
  return res.data;
};

export const createCourse = async (course) => {
  const res = await axios.post(API_URL, course, authHeader());
  return res.data;
};

export const updateCourse = async (id, updates) => {
  const res = await axios.put(`${API_URL}/${id}`, updates, authHeader());
  return res.data;
};

export const deleteCourse = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, authHeader());
  return res.data;
};

export const joinCourse = async (id) => {
  const res = await axios.post(`${API_URL}/${id}/join`, {}, authHeader());
  return res.data;
};

export const uploadCoursePdf = async (id, file) => {
  const formData = new FormData();
  formData.append("pdf", file);
  const res = await axios.post(`${API_URL}/${id}/upload`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getAllStudents = async () => {
  const res = await axios.get(`${API_URL}/students/all`, authHeader());
  return res.data;
};

export const uploadCourseIcon = async (id, file) => {
  const formData = new FormData();
  formData.append("icon", file);
  const res = await axios.post(`${API_URL}/${id}/icon`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateWeek = async (courseId, weekId, updates) => {
  const res = await axios.put(`${API_URL}/${courseId}/weeks/${weekId}`, updates, authHeader());
  return res.data;
};

export const recheckWeek = async (courseId, weekId) => {
  const res = await axios.post(`${API_URL}/${courseId}/weeks/${weekId}/recheck`, {}, authHeader());
  return res.data;
};

export const searchStudents = async (query) => {
  const res = await axios.get(`${API_URL}/students/search?q=${encodeURIComponent(query)}`, authHeader());
  return res.data;
};

export const addStudentToCourse = async (courseId, studentId) => {
  const res = await axios.post(`${API_URL}/${courseId}/students/${studentId}`, {}, authHeader());
  return res.data;
};

export const getPendingRequests = async () => {
  const res = await axios.get(`${API_URL}/requests/pending`, authHeader());
  return res.data;
};

export const acceptRequest = async (courseId, studentId) => {
  const res = await axios.post(`${API_URL}/${courseId}/requests/${studentId}/accept`, {}, authHeader());
  return res.data;
};

export const rejectRequest = async (courseId, studentId) => {
  const res = await axios.post(`${API_URL}/${courseId}/requests/${studentId}/reject`, {}, authHeader());
  return res.data;
};