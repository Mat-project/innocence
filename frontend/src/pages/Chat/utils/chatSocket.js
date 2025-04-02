class ChatSocket {
  constructor() {
    this.socket = null;
    this.callbacks = {
      message: [],
      typing: [],
      read: [],
      error: [],
      connect: [],
      disconnect: [],
    };
  }

  connect(roomId, token) {
    if (this.socket) {
      this.disconnect();
    }
    const wsProtocol =
      window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost = "127.0.0.1";
    const backendPort = "8000"; // update if running on a different port
    this.socket = new WebSocket(
      `${wsProtocol}//${backendHost}:${backendPort}/ws/chat/${roomId}/?token=${token}`
    );

    this.socket.onopen = () => {
      console.log(`Connected to chat room ${roomId}`);
      this.triggerCallbacks("connect");
    };

    this.socket.onclose = () => {
      console.log(`Disconnected from chat room ${roomId}`);
      this.triggerCallbacks("disconnect");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      this.triggerCallbacks("error", error);
    };

    document.addEventListener("DOMContentLoaded", function () {
      const socket = new WebSocket("ws://localhost:8000/ws/chat/12/");
  
      socket.onmessage = function (event) {
          const data = JSON.parse(event.data);
          console.log("Message received:", data);
  
          // Call displayMessage only if the container exists
          if (document.getElementById("message-container")) {
              displayMessage(data);
          } else {
              console.error("Message container not found!");
          }
      };
  });
  
  function displayMessage(data) {
      const messageContainer = document.getElementById("message-container");
  
      if (!messageContainer) {
          console.error("Message container not found!");
          return;
      }
  
      const messageElement = document.createElement("div");
      messageElement.textContent = `${data.sender}: ${data.message}`;
      messageContainer.appendChild(messageElement);
  }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  sendMessage(message, fileUrl = null) {
    this.send({
      type: "message",
      message,
      file_url: fileUrl,
    });
  }

  sendTypingStatus(isTyping) {
    this.send({
      type: "typing",
      is_typing: isTyping,
    });
  }

  markAsRead(messageIds) {
    this.send({
      type: "read",
      message_ids: messageIds,
    });
  }

  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
    return this;
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback);
    }
    return this;
  }

  triggerCallbacks(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(data));
    }
  }
}

export default new ChatSocket();