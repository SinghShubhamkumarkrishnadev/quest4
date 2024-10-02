import Login from "./pages/auth/Login";
import CreatePost from "./pages/posts/CreatePost";
import AllPost from "./pages/posts/AllPosts";
import { useAppSelector } from "./store";
import UserSpecificPosts from "./pages/posts/UserSpecificPosts";
import { RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import Posts from "./pages/posts/Posts";
import EditPost from "./pages/posts/EditPost";
import NotFound from "./pages/404";
import Register from "./pages/auth/Register";
import "./App.css";
import type { AuthState, UserResponse } from "./services/auth/types";

const App = () => {
    // Set the initial auth state
    let authState: AuthState = {
        user: null,
        token: null,
    };

    // Extract user and token from Redux state
    const { user, token } = useAppSelector((state) => state.auth);

    // Restore session from sessionStorage if available
    const userSession = sessionStorage.getItem("user");
    const response: UserResponse = userSession ? JSON.parse(userSession) : null;

    // If user is authenticated in sessionStorage, update the authState accordingly
    if (sessionStorage.getItem("isAuthenticated") === "true" && response !== null) {
        authState = {
            user: {
                username: response.username,
                id: response.userId,
                email: response.email,
                role: response.role,
            } ?? user,
            token: response.token ?? token,
        };
    } else {
        authState = {
            user,
            token,
        };
    }

    // Check if the user is authenticated
    const isAuthenticated = authState.user !== null && authState.token !== null;

    // Create the router
    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <Login authState={authState} isAuthenticated={isAuthenticated} />
            ),
            children: [
                {
                    path: "register",
                    element: (
                        <Register authState={authState} isAuthenticated={isAuthenticated} />
                    ),
                },
            ],
        },
        {
            path: "/post/create/",
            element: (
                <CreatePost isAuthenticated={isAuthenticated} authState={authState} />
            ),
        },
        {
            path: "/posts/",
            element: (
                <Posts isAuthenticated={isAuthenticated} authState={authState} />
            ),
            children: [
                {
                    path: "",
                    element: <AllPost />,
                },
                {
                    path: "user/:username",
                    element: <UserSpecificPosts isAuthenticated={isAuthenticated} />,
                    loader: async ({ params }) => {
                        return params.username;
                    },
                },
                {
                    path: "user/:username/post/edit/:postId",
                    element: <EditPost isAuthenticated={isAuthenticated} />,
                    loader: ({ params }) => {
                        return { username: params.username, postId: params.postId };
                    },
                },
            ],
        },
        {
            path: "*",
            element: <NotFound />,
        },
    ]);

    return (
        <div>
            <RouterProvider router={router} />
        </div>
    );
};

export default App;
