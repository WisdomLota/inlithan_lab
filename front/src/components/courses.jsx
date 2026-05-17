import React, { useEffect, useState } from "react";
import { getCourses, createCourse } from "../api/courses";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const addCourse = () => {
    createCourse({ name: "New Course", description: "Intro", teacher: "Jane Doe" })
      .then((res) => setCourses([...courses, res.data]));
  };

  return (
    <div>
      <h2>Courses</h2>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>{c.name} — {c.teacher}</li>
        ))}
      </ul>
      <button onClick={addCourse}>Add Course</button>
    </div>
  );
}
