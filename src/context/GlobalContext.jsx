import axios from "axios";
import Cookies from "js-cookie";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export const GlobalContext = createContext();

export const GlobalProvider = (props) => {
  let navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [currentId, setCurrentId] = useState(-1);
  const [fetchStatus, setFetchStatus] = useState(true);
  const [total, setTotal] = useState(0);
  const [activeFilter, setActiveFilter] = useState("all");
  const [token, setToken] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState({ name: "" });
  const [user, setUser] = useState({});
  useEffect(() => {
    if (Cookies.get("token") !== undefined) {
      setToken(Cookies.get("token"));
    }
    if (fetchStatus === true) {
      todolist();
    }
    getUser();
    setFetchStatus(false);
  }, [fetchStatus, setFetchStatus, currentId, navigate]);

  const todolist = async () => {
    await axios
      .get("https://bewildered-rose-cummerbund.cyclic.app/todos", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((response) => {
        setTodos(response.data.data);
        setTotal(response.data.data.length);
        console.log(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const getUser = async () => {
    const id = Cookies.get("id");
    console.log(id);
    const token = Cookies.get("token");

    if (id && token) {
      await axios
        .get(`https://bewildered-rose-cummerbund.cyclic.app/users/${id}`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((response) => {
          console.log(response.data.data);
          setUser(response.data.data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.log("ID or token is not available in cookies");
    }
  };

  const handleInput = (event) => {
    let value = event.target.value;
    setInput({ ...input, [event.target.name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsEditing(false);
    let { todoName } = input;
    let kukis = Cookies.get("token");
    if (todoName.trim() === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Todo name cannot be empty!",
      });
      return;
    }

    if (currentId === -1) {
      axios
        .post(
          "https://bewildered-rose-cummerbund.cyclic.app/todos",
          { name: todoName },
          {
            headers: {
              Authorization: "Bearer " + kukis,
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Todo successfully added!",
          });
          if (activeFilter === "completed") {
            getCompletedTodos();
          } else if (activeFilter === "active") {
            getActiveTodos();
          } else {
            setTodos([...todos, response.data]);
            setFetchStatus(true);
          }
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      axios
        .put(
          `https://bewildered-rose-cummerbund.cyclic.app/todos/${currentId}`,
          { name: todoName, isdone: false },
          {
            headers: {
              Authorization: "Bearer " + kukis,
            },
          }
        )
        .then((response) => {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Todo successfully edited!",
          });
          setFetchStatus(true);
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    }
    setInput({ todoName: "" });
    setCurrentId(-1);
    console.log(input);
  };

  const handleCancel = () => {
    setIsEditing(false);
    Swal.fire({
      title: "Edit Cancelled!",
      icon: "info",
      showConfirmButton: true,
    });
    setCurrentId(-1);
    navigate("/");
    setInput({ name: "" });
  };

  const handleDelete = (id) => {
    console.log(id);
    const kukis = Cookies.get("token");
    if (currentId === id) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You are editing this todo!",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`https://bewildered-rose-cummerbund.cyclic.app/todos/${id}`, {
            headers: {
              Authorization: "Bearer " + kukis,
            },
          })
          .then((response) => {
            if (activeFilter === "completed") {
              getCompletedTodos();
            } else if (activeFilter === "active") {
              getActiveTodos();
            } else {
              setFetchStatus(true);
            }
          })
          .catch((error) => {
            console.log(error);
          });
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      } else {
        Swal.fire("Cancelled!", "Your file is safe!", "error");
      }
    });
  };

  const handleEdit = (id) => {
    setIsEditing(true);
    if (token === undefined) {
      return Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "You are not logged in!",
      }).then(() => {
        navigate("/");
      });
    }
    setCurrentId(id);
    navigate(`todos/${id}`);
    console.log(id);
  };
  const getActiveTodos = () => {
    axios
      .get("https://bewildered-rose-cummerbund.cyclic.app/todos/", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((response) => {
        setTodos(response.data.data.filter((todo) => todo.isdone === false));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getCompletedTodos = () => {
    axios
      .get("https://bewildered-rose-cummerbund.cyclic.app/todos/", {
        headers: {
          Authorization: "Bearer " + Cookies.get("token"),
        },
      })
      .then((response) => {
        setTodos(response.data.data.filter((todo) => todo.isdone === true));
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleComplete = (id, currentStatus) => {
    const isdone = !currentStatus;
    const name = todos.find((todo) => todo.id === id).name;
    axios
      .put(
        `https://bewildered-rose-cummerbund.cyclic.app/todos/${id}`,
        { name: name, isdone: isdone },
        {
          headers: {
            Authorization: "Bearer " + Cookies.get("token"),
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (activeFilter === "completed") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Todo '${name}' has been ${isdone ? "marked as complete" : "marked as incomplete"}!`,
          });
          getCompletedTodos();
        } else if (activeFilter === "active") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Todo '${name}' has been ${isdone ? "marked as complete" : "marked as incomplete"}!`,
          });
          getActiveTodos();
        } else {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Todo status successfully changed!",
          });
          setFetchStatus(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleFilter = (event) => {
    let filter = event.target.value.toLowerCase();
    setActiveFilter(filter);
    Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      iconColor: "white",
      customClass: {
        popup: "colored-toast",
      },
      timer: 2000,
      timerProgressBar: true,
    }).fire({
      icon: "info",
      title: `Filtered to ${filter} status!`,
    });
    if (filter === "all") {
      setFetchStatus(true);
    } else if (filter === "completed") {
      getCompletedTodos();
    } else {
      getActiveTodos();
    }
  };

  const handleRegister = (event) => {
    event.preventDefault();
    let { name, username, email, password } = input;
    axios
      .post("https://bewildered-rose-cummerbund.cyclic.app/auth/register", {
        name,
        username,
        email,
        password,
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "User successfully registered!",
        });
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "User already exists!",
        });
      })
      .finally(() => {
        setInput({ name: "", username: "", email: "", password: "" });
        navigate("/");
      });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    let { username, password } = input;
    axios
      .post("https://bewildered-rose-cummerbund.cyclic.app/auth/login", {
        username,
        password,
      })
      .then((res) => {
        console.log(res);
        let data = res.data;
        let { token, username, id, id_level } = data;
        Cookies.set("token", token, { expires: 1 });
        Cookies.set("username", username, { expires: 1 });
        Cookies.set("id", id, { expires: 1 });
        Cookies.set("id_level", id_level, { expires: 1 });
        console.log(res.data.username);
        Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          iconColor: "white",
          customClass: {
            popup: "colored-toast",
          },
          timer: 3000,
          timerProgressBar: true,
        }).fire({
          icon: "success",
          title: `Welcome back, ${username}!`,
        });
        Swal.fire({
          title: "Information!",
          text: "Click Github Logo to Logout from the app",
          icon: "info",
          confirmButtonText: "OK",
        });
        todolist();
        navigate("/todos");
      })
      .catch((error) => {
        Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          iconColor: "white",
          customClass: {
            popup: "colored-toast",
          },
          timer: 3000,
          timerProgressBar: true,
        }).fire({
          icon: "error",
          title: "User not found!",
        });
      });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove("token");
        Cookies.remove("username");
        Cookies.remove("id");
        Cookies.remove("id_level");
        setToken(undefined);
        Swal.fire("Logged Out!", "You have been logged out.", "success");
        navigate("/");
      } else {
        Swal.fire("Cancelled!", "You are still logged in!", "error");
      }
    });
  };

  let states = {
    todos,
    input,
    currentId,
    fetchStatus,
    total,
    activeFilter,
    token,
    isEditing,
    user,
    setInput,
    setTodos,
    setCurrentId,
    setFetchStatus,
    setTotal,
    setActiveFilter,
    setToken,
    setIsEditing,
    setUser,
  };

  let eventHandlers = {
    handleInput,
    handleSubmit,
    handleCancel,
    handleDelete,
    handleEdit,
    handleComplete,
    handleFilter,
    handleRegister,
    handleLogin,
    handleLogout,
  };

  return (
    <GlobalContext.Provider value={{ states, eventHandlers }}>
      {props.children}
    </GlobalContext.Provider>
  );
};
