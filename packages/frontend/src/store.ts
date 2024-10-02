import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { blogApi } from "./services/posts/blogSlice";
import { authBlogApi, refreshAuthentication } from "./services/auth/authSlice";
import authReducer from "./services/auth/authSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";  // For refetching on focus/reconnect

/**
 * This part is important. We need to keep the user logged in even after browser refresh.
 * This is because our app is running client-side so any reload can cause changes to be discarded.
 **/
const authListener = createListenerMiddleware();

// Configure the store with reducers and middleware
const store = configureStore({
    reducer: {
        [blogApi.reducerPath]: blogApi.reducer,
        [authBlogApi.reducerPath]: authBlogApi.reducer,
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(authBlogApi.middleware)
            .concat(blogApi.middleware)
            .concat(authListener.middleware),  // Add the listener middleware here
});

// Set up listeners for refetching data on window focus and reconnect
setupListeners(store.dispatch);

/**
 * Define RootState and AppDispatch types
 * This is a common pattern in Redux applications for type-safe use of store and dispatch
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export default store;

/**
 * This part is important. We need to keep the user logged in even after browser refresh.
 * We achieve this by using the listener to check if auth state is null and restoring it from sessionStorage.
 **/
authListener.startListening.withTypes<RootState, AppDispatch>()({
    predicate(_action, currentState, _originalState) {
        return (
            currentState.auth.token === null &&
            currentState.auth.user === null &&
            sessionStorage.getItem("isAuthenticated") === "true"
        );
    },
    effect: async (_action, listenerApi) => {
        console.log("Restoring user session from sessionStorage");
        listenerApi.dispatch(refreshAuthentication());
        await listenerApi.delay(800);  // Optional delay for smoother transitions
    },
});
