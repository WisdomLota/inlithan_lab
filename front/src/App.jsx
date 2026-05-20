import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Sidebar from "./components/sidebar";
import AI from "./components/ai";
import Activities from "./components/activities";
import Courses from "./components/courses";
import Auth from "./components/auth";

export default function App() {
  return (
    <BrowserRouter>
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 flex-1">
        <Routes>
          <Route path="/activities" element={<Activities />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </div>
    </BrowserRouter>
  );
}