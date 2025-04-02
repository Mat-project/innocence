import React from "react";

const ChatRoomList = ({ rooms, selectedRoom, onSelectRoom }) => {
  return (
    <ul>
      {rooms.map((room) => (
        <li
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={`cursor-pointer px-4 py-2 hover:bg-blue-100 border-b ${
            selectedRoom === room.id ? "bg-blue-200" : ""
          }`}
        >
          {room.name}
        </li>
      ))}
    </ul>
  );
};

export default ChatRoomList;