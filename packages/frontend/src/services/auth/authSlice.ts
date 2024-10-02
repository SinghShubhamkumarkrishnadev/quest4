import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSlice } from "@reduxjs/toolkit";
import type {
    UserResponse,
    LoginRequest,
    LogOutResponse,
    AuthState,
    RegisterResponse,
    RegisterRequest,
} from "./types";
import type { RootState } from "../../store";

// Define the API service using RTK Query
export const authBlogApi = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl: "https://studious-guide-x6rr6r5px7rhp756-4040.app.github.dev/api/",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    endpoints: (builder) => ({
        login: builder.mutation<UserResponse, LoginRequest>({
            query: (credentials) => ({
                url: "auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        logout: builder.mutation<LogOutResponse, void>({
            query: () => ({
                url: "auth/logout",
                method: "POST",
                validateStatus(response) {
                    return response.ok === true;
                },
            }),
        }),
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (info) => ({
                url: "auth/register",
                method: "POST",
                body: info,
                validateStatus(response) {
                    return response.ok === true;
                }
            })
        })
    }),
});

// Export hooks for API endpoints
export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = authBlogApi;

// Define the authSlice to handle state for auth
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null,
    } as AuthState,
    reducers: {
        refreshAuthentication: (state) => {
            const isAuthenticated = sessionStorage.getItem("isAuthenticated");
            if (isAuthenticated === "true") {
                const userSession = sessionStorage.getItem("user");
                const response: UserResponse = JSON.parse(userSession as string);
                state.token = response.token;
                state.user = {
                    username: response.username,
                    id: response.userId,
                    email: response.email,
                    role: response.role,
                };
            }
            return state;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authBlogApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                state.token = payload.token;
                state.user = {
                    id: payload.userId,
                    username: payload.username,
                    email: payload.email,
                    role: payload.role,
                };
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("user", `${JSON.stringify(payload)}`);
            }
        );
        builder.addMatcher(authBlogApi.endpoints.logout.matchFulfilled, (state) => {
            state.token = null;
            state.user = null;
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("user");
        });
    },
});

// Export the refreshAuthentication action
export const { refreshAuthentication } = authSlice.actions;

export default authSlice.reducer;
