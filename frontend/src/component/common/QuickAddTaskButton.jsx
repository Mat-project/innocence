//// filepath: /d:/project/innovsence/frontend/src/component/common/QuickAddTaskButton.jsx
import React from 'react';

const QuickAddTaskButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      +
    </button>
  );
};

export default QuickAddTaskButton;