import React from "react";

export const Switch = ({ checked, onChange }) => {
  return (
    <label className="flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      <div className={`w-10 h-5 rounded-full p-1 ${checked ? "bg-blue-600" : "bg-gray-300"}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}></div>
      </div>
    </label>
  );
};
