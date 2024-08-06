import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../context/GlobalContext.jsx";
import { useParams } from "react-router-dom";
import axios from "axios";
import { TbEdit, TbHttpDelete, TbCheck } from "react-icons/tb";
import { PiGithubLogoDuotone } from "react-icons/pi";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
export default function TodoList() {
  const [click, setClick] = useState(false);
  const { states, eventHandlers } = useContext(GlobalContext);
  const { id } = useParams();
  const {
    todos,
    input,
    setInput,
    total,
    activeFilter,
    currentId,
    isEditing,
    user,
  } = states;
  const {
    handleInput,
    handleSubmit,
    handleCancel,
    handleDelete,
    handleEdit,
    handleComplete,
    handleFilter,
    handleLogout,
  } = eventHandlers;
  const { name } = user;

  useEffect(() => {
    if (isEditing) {
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
        icon: "info",
        title: `You are editing a todo!`,
      });
    }
    if (id !== undefined) {
      axios
        .get(`http://localhost:3000/todos/${id}`, {
          headers: {
            Authorization: "Bearer " + Cookies.get("token"),
          },
        })
        .then((response) => {
          let data = response.data.data;
          console.log(data);
          setInput({ name: data.name });
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setInput({ name: "" });
    }
  }, [setInput, id, isEditing, user]);

  return (
    <>
      <div className="fixed bottom-0 right-0 lg:right-5 z-10 px-4 py-2 font-mono">
        <div className="absolute right-24 bottom-16">
          <div
            className={`"bg-white rounded-lg border w-[200px] border-gray-300 px-4 py-2 my-4" ${
              click ? "flex flex-col justify-between items-center" : "hidden"
            }`}
          >
            <h2>Hello {name} </h2>
            <button
              className="bg-red-200 w-full border rounded-md px-4 py-2"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className=" bg-sky-200 rounded-full px-4 py-2">
          <button onClick={() => setClick(!click)}>
            <PiGithubLogoDuotone size={50} />
          </button>
        </div>
      </div>

      <div className="container font-mono w-full mx-auto">
        <div className="flex flex-col justify-center items-center mt-2 mb-4 mx-2 border lg:rounded-md lg:mx-96 ">
          <h1 className="mt-10 mb-4 font-bold text-2xl">Whatcha Gonna Do?</h1>
          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            className="flex flex-col lg:flex-row gap-2 my-4"
          >
            <input
              type="text"
              className="border rounded-md px-4 py-2"
              name="todoName"
              value={input.todoName}
              onChange={handleInput}
            />

            <button
              className="bg-sky-200 border rounded-md px-4 py-2"
              type="submit"
            >
              Add
            </button>

            {currentId !== -1 && (
              <button
                className="bg-red-200 border rounded-md px-4 py-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        <nav className="flex justify-center items-center gap-10 my-4 border lg:rounded-md py-2 px-4 mx-2 lg:mx-96">
          <button
            disabled={isEditing}
            onClick={handleFilter}
            value={"all"}
            className={`px-4 py-2 rounded-md ${
              activeFilter === "all" ? "bg-sky-200" : ""
            } ${isEditing ? "cursor-not-allowed" : ""}`}
          >
            All
          </button>

          <button
            disabled={isEditing}
            onClick={handleFilter}
            value={"completed"}
            className={`px-4 py-2 rounded-md ${
              activeFilter === "completed" ? "bg-sky-200" : ""
            }`}
          >
            Completed
          </button>

          <button
            disabled={isEditing}
            onClick={handleFilter}
            value={"active"}
            className={`px-4 py-2 rounded-md ${
              activeFilter === "active" ? "bg-sky-200" : ""
            }`}
          >
            Active
          </button>
        </nav>

        <div className="border lg:rounded-md bg-sky-200 mt-4 mb-10  lg:mx-96">
          <ul className="grid grid-cols-1 px-4 py-2 m-2">
            {todos.length === 0 ? (
              <p>No todos found</p>
            ) : (
              todos.map((res, index) => {
                return (
                  <li
                    key={index}
                    className="flex justify-between items-center m-2 border border-black px-4 py-2"
                  >
                    <div key={res.id} className="flex gap-2">
                      <span className={`${res.isdone ? "line-through" : ""}`}>
                        {index + 1 + ".\t"}
                        {res.name}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        disabled={isEditing}
                        onClick={() => handleComplete(res.id, res.isdone)}
                      >
                        <TbCheck size={30} />
                      </button>
                      <button
                        disabled={isEditing}
                        onClick={() => handleDelete(res.id)}
                      >
                        <TbHttpDelete size={30} />
                      </button>
                      <button onClick={() => handleEdit(res.id)}>
                        <TbEdit size={30} />
                      </button>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </div>

      <div className="fixed bg-sky-200 w-full bottom-0 left-0 p-2">
        <p>Total: {total}</p>
      </div>
    </>
  );
}
