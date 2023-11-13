import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import TodoList from "./components/todo-list";
import { GlobalProvider } from "./context/GlobalContext";
import "./index.css";
import Login from "./components/login";
import Cookies from "js-cookie";
import Register from "./components/register";

function App() {
  const LoginRoute = (props) => {
    if (Cookies.get("token") !== undefined) {
      return <Navigate to={"/"} />;
    } else if (Cookies.get("token") === undefined) {
      return props.children;
    }
  };

  const CheckAuth = (props) => {
    if (Cookies.get("token") === undefined) {
      return <Navigate to={"/login"} />;
    } else if (Cookies.get("token") !== undefined) {
      return props.children;
    }
  };
  return (
    <BrowserRouter>
      <GlobalProvider>
        <Routes>
          <Route
            path="/"
            element={
              <CheckAuth>
                <TodoList />
              </CheckAuth>
            }
          />
          <Route
            path="/:id"
            element={
              <CheckAuth>
                <TodoList />
              </CheckAuth>
            }
          />
          <Route
            path="/login"
            element={
              <LoginRoute>
                <Login />
              </LoginRoute>
            }
          />
          <Route
            path="/register"
            element={
              <LoginRoute>
                <Register />
              </LoginRoute>
            }
          />
        </Routes>
      </GlobalProvider>
    </BrowserRouter>
  );
}

export default App;
