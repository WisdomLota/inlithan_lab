import React, { useEffect, useState } from "react";
import { getActivities, createActivity } from "../api/activities";

export default function Activities() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    getActivities().then(setActivities);
  }, []);

  const addActivity = () => {
    createActivity({ type: "quiz", title: "New Activity" })
      .then((res) => setActivities([...activities, res.data]));
  };

  return (
    <div>
      <h2>Activities</h2>
      <ul>
        {activities.map((a) => (
          <li key={a.id}>{a.title} ({a.type})</li>
        ))}
      </ul>
      <button onClick={addActivity}>Add Activity</button>
    </div>
  );
}
