import React from "react";
import { Calendar } from "lucide-react";
import PropTypes from "prop-types";

function ActivitySection({ activities }) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-3">
        <Calendar className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold">My Point Activity</h2>
      </div>
      <ul className="mt-4 space-y-4">
        {activities.map((activity) => (
          <li key={activity.id} className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
                <span>+{activity.points}</span>
              </div>
              <span className="text-gray-800 dark:text-gray-200">{activity.description}</span>
            </div>
            <span className="text-sm text-gray-500">{activity.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ActivitySection.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      type: PropTypes.string.isRequired,
      points: PropTypes.number.isRequired,
      description: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ActivitySection;
