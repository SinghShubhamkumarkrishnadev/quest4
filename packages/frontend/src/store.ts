import { configureStore } from "@reduxjs/toolkit";
import { blogApi } from "./services/posts/blogSlice";
import { authBlogApi, refreshAuthentication } from "./services/auth/authSlice";
import authReducer from "./services/auth/authSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";


const store = configureStore({
	reducer: {
    	[blogApi.reducerPath]: blogApi.reducer,
    	[authBlogApi.reducerPath]: authBlogApi.reducer,
    	auth: authReducer
	},
	middleware: (getDefaultMiddleware) => {
    	return getDefaultMiddleware()
        	.concat(authBlogApi.middleware)
        	.concat(blogApi.middleware);
	},
});

/**
 *  This is a very _common pattern_ for Redux.
 **/
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export default store;