
import React from "react";
import PropTypes from "prop-types";

export function Progress({ value, max = 100, className = "" }) {
  const percentage = Math.min(Math.max(value, 0), max) / max * 100;
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${className}`}>
      <div
        className="h-2 rounded-full bg-indigo-600"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

Progress.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number,
  className: PropTypes.string,
};

export default Progress;