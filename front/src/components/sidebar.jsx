import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <nav className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">Inlihtan Labs</h2>
      <ul>
        <li className="mb-2">
          <Link to="/activities" className="block py-2 px-4 rounded hover:bg-gray-700">
            Activities
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/courses" className="block py-2 px-4 rounded hover:bg-gray-700">
            Courses
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/ai" className="block py-2 px-4 rounded hover:bg-gray-700">
            AI
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/auth" className="block py-2 px-4 rounded hover:bg-gray-700">
            Auth
          </Link>
        </li>
        <li className="mb-2">
          <Link to="/upload" className="block py-2 px-4 rounded hover:bg-gray-700">
            Upload
          </Link>
        </li>
      </ul>
    </nav>
  );
}