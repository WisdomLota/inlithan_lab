import React from "react";
import Activities from "./components/activities";
import Courses from "./components/courses";
import AI from "./components/ai";
import Auth from "./components/auth";

function App() {
  return (
    <>
      <h1>Inlihtan Labs</h1>
      <Auth />
      <Activities />
      <Courses />
      <AI />
    </>
  );
}

export default App
