import React from "react";
import "./App.css";
import socket from "./socket";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [messages, setMessages] = React.useState([]);
  const [rooms, setRooms] = React.useState([]);
  const [currentRoom, setCurrentRoom] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const messagesRef = React.useRef(messages);

  React.useEffect(() => {
    socket.on("connection");

    return () => {
      socket.disconnect();
    };
  }, []);

  React.useEffect(() => {
    askForName();
  }, []);

  React.useEffect(() => {
    socket.on("rooms", function (data) {
      // data= rooms from backend
      console.log("data", data);
      if (data && Array.isArray(data)) {
        setRooms(data);
      }
    });
  }, [rooms]);

  const askForName = () => {
    const name = prompt("What is your name");
    if (name) {
      socket.emit("login", name, (res) => {
        console.log("response from backend", res);
        setUser(res);
      });
    } else {
      askForName();
    }
  };

  React.useEffect(() => {
    socket.on("message", function (chat) {
      console.log(chat);
      console.log(messagesRef);
      messagesRef.current = [chat, ...messagesRef.current];
      setMessages(messagesRef.current);
    });
  }, []);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    const message = e.target.chat.value;
    socket.emit("sendMessage", message);
    const form = document.getElementById("chatform");
    form.reset();
  };

  const Rooms = (props) =>
    props.rooms.map((e, idx) => {
      return (
        <span
          className={
            !props.currentRoom
              ? ""
              : e._id === props.currentRoom._id
              ? "bold"
              : ""
          }
          onClick={() => {
            if (props.currentRoom) {
              socket.emit("leaveRoom", props.currentRoom._id);
            }
            socket.emit("joinRoom", e._id, (res) => {
              if (res.status === "ok") {
                props.setCurrentRoom(res.data.room);
                console.log(res.data.history);
                props.setMessages([...res.data.history]);
                props.messagesRef.current = [...res.data.history];
              } else {
                alert("something wrong");
              }
            });
          }}
        >
          {" "}
          {e.room} {idx === props.rooms.length - 1 ? "" : ","}{" "}
        </span>
      );
    });

  const Message = ({ obj, user }) => {
    return (
      <p>
        <span
          className={obj.user._id === user._id ? "red" : "black"}
          style={{ fontWeight: "bold" }}
        >
          {obj.user.name}
        </span>
        : {obj.chat}
      </p>
    );
  };

  const renderMessages = (messages) => {
    return messages.map((e) => <Message key={e.id} obj={e} user={user} />);
  };

  return (
    <div>
      <div className="divider"></div>

      <p> {user ? `Welcome ${user.name}` : ""}</p>

      <div className="divider"></div>

      <form onSubmit={handleChatSubmit} id="chatform">
        <input name="chat" placeholder="chat with me" />
        <input type="submit" value="send message" />
      </form>
      <div className="divider"></div>

      <div>
        <Rooms
          rooms={rooms}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
          setMessages={setMessages}
          messagesRef={messagesRef}
        />
      </div>
      {renderMessages(messages)}
    </div>
  );
}

export default App;
