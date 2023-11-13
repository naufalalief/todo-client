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

  useEffect(() => {
    if (Cookies.get("token") !== undefined) {
      setToken(Cookies.get("token"));
    }
    if (fetchStatus === true) {
      axios
        .get("http://localhost:3000/todos", {
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
    }
    setFetchStatus(false);
  }, [fetchStatus, setFetchStatus, currentId, navigate]);

  const handleInput = (event) => {
    let value = event.target.value;
    setInput({ ...input, [event.target.name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsEditing(false);
    let { name } = input;
    let kukis = Cookies.get("token");
    if (name.trim() === "") {
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
          "http://localhost:3000/todos",
          { name },
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
          `http://localhost:3000/todos/${currentId}`,
          { name, isdone: false },
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
    setInput({ name: "" });
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
          .delete(`http://localhost:3000/todos/${id}`, {
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
        navigate("/login");
      });
    }
    setCurrentId(id);
    navigate(`/${id}`);
    console.log(id);
  };
  const getActiveTodos = () => {
    axios
      .get("http://localhost:3000/todos/", {
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
      .get("http://localhost:3000/todos/", {
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
        `http://localhost:3000/todos/${id}`,
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
            text: `Todo removed from completed!`,
          });
          getCompletedTodos();
        } else if (activeFilter === "active") {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: `Todo added to completed!`,
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
      .post("http://localhost:3000/auth/register", {
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
        navigate("/login");
      });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    let { username, password } = input;
    axios
      .post("http://localhost:3000/auth/login", {
        username,
        password,
      })
      .then((res) => {
        console.log(res);
        let data = res.data;
        let { token, username, name } = data;
        Cookies.set("token", token, { expires: 1 });
        Cookies.set("username", username, { expires: 1 });
        Cookies.set("name", name, { expires: 1 });
        console.log(res.data.username);
        navigate("/");
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
        setToken(undefined);
        Swal.fire("Logged Out!", "You have been logged out.", "success");
        navigate("/login");
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
    setInput,
    setTodos,
    setCurrentId,
    setFetchStatus,
    setTotal,
    setActiveFilter,
    setToken,
    setIsEditing,
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
