import React from "react";
import "./App.css";
import socket from "./socket";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

function App() {
  const [messages, setMessages] = React.useState([]);
  const [users, setUsers] = React.useState([]);
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
      setRooms(data);
    });
  }, [rooms]);

  React.useEffect(() => {
    socket.on("users", function (data) {
      console.log("data", data);
      if (data && Array.isArray(data)) {
        setUsers(data);
      }
    });
  }, [users]);

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
  const autoScroll = () => {
    var elem = document.getElementById("messages");
    console.log(elem.lastElementChild);
    if (!elem.lastElementChild) return;
    const lastElHeight = elem.lastElementChild.scrollHeight;
    const firstElHeight = elem.firstElementChild.scrollHeight;
    console.log(lastElHeight);
    console.log(firstElHeight);
    const a = messagesRef.current[0];
    if (
      (elem &&
        elem.scrollHeight - elem.scrollTop <
          elem.offsetHeight + lastElHeight * 5) ||
      a.chat.startsWith("Welcome")
    ) {
      elem.scrollTop = elem.scrollHeight;
    }
  };

  const Rooms = (props) =>
    props.rooms.map((e, idx) => {
      return (
        <div className="room tweetbtn">
          <div class="row my-3">
            <div id="outerMenuContainer">
              <div className="chat-room">
                <p
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
                      } else {
                        alert("something wrong");
                      }
                    });
                  }}
                >
                  {" "}
                  {e.room + " " + e.members.length}{" "}
                  {idx === props.rooms.length - 1 ? "" : ""}{" "}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    });

  const showMessage = (chat) => {
    if (!chat) {
      return chat;
    }
    if (chat.substring(0, 5) === "[IMG]") {
      return (
        <img
          src={chat.substring(5, chat.length)}
          alt="Girl in a jacket"
          height="100px"
        />
      );
    } else {
      return chat;
    }
  };

  const Message = ({ obj, user }) => {
    return (
      <p>
        <span
          className={obj.user._id === user._id ? "red" : "black"}
          style={{ fontWeight: "bold" }}
        >
          {obj.user.name}
        </span>
        : {showMessage(obj.chat)}
      </p>
    );
  };

  React.useEffect(() => {
    socket.on("chatHistory", function (chatArray) {
      messagesRef.current = chatArray;
      setMessages(messagesRef.current);
    });
  });

  const renderMessages = (messages) => {
    return messages.map((e) => <Message key={e.id} obj={e} user={user} />);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const file = e.target.upload.files[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("upload_preset", "uzgp86oy");
    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/kyakaze/image/upload",
      form
    );
    const message = "[IMG]" + res.data.secure_url;
    socket.emit("sendMessage", message);
    console.log("hxi", res.data.secure_url);
  };

  const renderRoom = (roomId) => {
    for (let i = 0; i < rooms.length; i++)
      if (rooms[i]._id === roomId) return rooms[i].room;
  };

  return (
    <div>
      {/* <div className="divider"></div>
      <p> {user ? `Welcome ${user.name}` : ""}</p>
      <div className="divider"></div>
      <form onSubmit={handleChatSubmit} id="chatform">
        <input name="chat" placeholder="chat with me" />
        <input className="send-msg " type="submit" value="send message" />
      </form>
      <div className="chat-room">
        <Rooms
          rooms={rooms}
          currentRoom={currentRoom}
          setCurrentRoom={setCurrentRoom}
          setMessages={setMessages}
          messagesRef={messagesRef}
        />
      </div>
      <div className="chat">{renderMessages(messages)}</div> */}

      <div class="container main-section" style={{ width: "100%" }}>
        <div class="row">
          <div class="col-1"></div>
          <div class="col-3 pr-5 mr-2">
            <div class="row">
              <div class="col">
                {/* <img alt="twitter-logo" width="80" height="80" /> */}
                <h1 class="name-app style-name">Meow</h1>
              </div>
            </div>
            <div class="row my-3">
              <div id="outerMenuContainer">
                <div class="col-2 mr-4 py-2 px-4"></div>
                <div
                  class="col-10 py-2"
                  style={{
                    "margin-right": "0px",
                    "padding-right": "0px",
                    "font-weight": "700",
                    "font-size": "larger",
                  }}
                >
                  <a
                    href="#Home"
                    style={{ cursor: "pointer" }}
                    style={{ color: "#16a2f2" }}
                  ></a>
                </div>
              </div>
            </div>
            <div className="chat-room">
              <Rooms
                rooms={rooms}
                currentRoom={currentRoom}
                setCurrentRoom={setCurrentRoom}
              />
            </div>
            <div class="row my-3"></div>

            <div class="row my-3">
              <div class="col">
                <button
                  data-toggle="modal"
                  data-target="#exampleModalCenter"
                  class="tweetbtn"
                  href="#"
                >
                  Show more
                </button>
              </div>
            </div>
          </div>

          <div
            class="col-5"
            style={{
              "border-right": "#e6ecf0 solid 1px",
              "border-left": "#e6ecf0 solid 1px",
              "padding-left": "0px",
              "padding-right": "0p",
            }}
          >
            <nav class="navbar sticky-top navbar-light my-2" id="leftNav">
              <span style={{ color: "hsl(202, 27%, 68%)" }}>
                <i class="fas fa-stars fa-lg"></i>
              </span>

              <span className="welcom">
                {user ? `Welcome ${user.name}` : ""}
              </span>
            </nav>
            <hr />

            <div className="chat-room">
              <div id="inputArea" class="px-3">
                <div className="chat">
                  <div className="chat-mess">{renderMessages(messages)}</div>

                  <div>
                    <form onSubmit={handleChatSubmit} id="chatform">
                      <input
                        className="msg"
                        name="chat"
                        placeholder="chat with me"
                      />
                      <input
                        className="send-msg"
                        type="submit"
                        value="Send message"
                      />
                    </form>
                  </div>
                  <div>
                    <form onSubmit={handleUpload}>
                      <input type="file" name="upload" />
                      <input
                        className="send-msg"
                        type="submit"
                        value="upload"
                      />
                    </form>
                  </div>
                </div>

                <div className="chat" id="card-0" class="dn-twitt-area"></div>
              </div>
            </div>
          </div>

          <div class="col-3">
            <nav class="navbar sticky-top navbar-light" id="rightNav">
              <span style={{ position: "absolute; z-index: 100" }}>
                {/* <img src="Img/magnify.svg" alt="" class="ml-3" /> */}
              </span>
              <div>
                <input
                  class="form-control mr-sm-2 pl-5"
                  type="search"
                  placeholder="Search Friends"
                  aria-label="Search"
                  id="search"
                />
              </div>
            </nav>
            {/* <div id="trendings" class="py-3">
              <ul class="list-group mb-3">
                <li
                  class="list-group-item d-flex justify-content-between lh-condensed content"
                  id="trending4"
                >
                  <div>
                    <small class="text-muted">TopTreading</small>
                    <h6 class="my-0 hashtag">Dior</h6>
                    <small class="text-muted">5,900 Tweets</small>
                  </div>
                  <span class="text-muted">
                    <i class="fas fa-chevron-down"></i>
                  </span>
                </li>
                <li
                  class="list-group-item d-flex justify-content-between lh-condensed content"
                  style={{ "border-radius": "0px 0px 15px 15px" }}
                  id="last-li"
                >
                  <div>
                    <h6 class="my-0">
                      <a
                        href="#"
                        style={{
                          color: "rgba(29, 161, 242, 1)",
                          "text-decoration": "none",
                        }}
                      >
                        Show more
                      </a>
                    </h6>
                  </div>
                </li>
              </ul>
            </div> */}

            <div id="whoToFollow" class="">
              <ul class="list-group mb-3">
                <li
                  class="list-group-item d-flex justify-content-between lh-condensed"
                  style={{ "border-radius": "15px 15px 0px 0px" }}
                >
                  <div>
                    <h5 class="whoToFollow-header">List friends</h5>
                  </div>
                </li>
                {users.map((user) => (
                  <li class="list-group-item content">
                    <div class="row">
                      <div class="col-2">
                        {/* <img
                        src="Img/xuka.png"
                        id="moreToFollowImg"
                        alt="Avatar"
                      /> */}
                      </div>
                      <div class="col-6">
                        <div style={{ display: "flex" }}>
                          <h6 class="my-0 hashtag">
                            <strong>{user.name}</strong>
                          </h6>
                          <i class="ml-1 fas fa-badge-check"></i>
                        </div>
                      </div>
                      <div class="col-4">
                        <a
                          href="#"
                          class="followBtn"
                          id="following"
                          onclick="followClicked()"
                          data-toggle="modal"
                          data-target="#exampleModal"
                        >
                          {renderRoom(user.room)}
                        </a>
                      </div>
                    </div>
                  </li>
                ))}

                <li
                  class="list-group-item d-flex justify-content-between lh-condensed content"
                  style={{ "border-radius": "0px 0px 15px 15px" }}
                >
                  <div>
                    <h6 class="show-more-btn">
                      <a
                        href="#"
                        style={{
                          color: "#fc9105",
                          "text-decoration": "none",
                        }}
                      >
                        Show more
                      </a>
                    </h6>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        class="modal fade"
        id="retweetModal"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      ></div>
      <div
        class="modal fade"
        id="exampleModalCenter"
        tabindex="-1"
        role="dialog"
        aria-labelledby="exampleModalCenterTitle"
        aria-hidden="true"
      ></div>
    </div>
  );
}

export default App;
