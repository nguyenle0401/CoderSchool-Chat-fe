import React from "react";

export default function chatInput({ user }) {
  const handleChatSubmit = (e) => {
    e.preventDefault();
    const message = e.target.chat.value;
    socket.emit("sendMessage", message);
    const form = document.getElementById("chatform");
    form.reset();
  };
  return <div></div>;
}
