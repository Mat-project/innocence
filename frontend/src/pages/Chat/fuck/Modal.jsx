import React from "react";

const Modal = ({ onClose }) => {
  // Simple modal UI that you can extend to include a form for creating a new chat room
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded shadow-lg p-6 w-1/3">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold">Add Room</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Room name"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;