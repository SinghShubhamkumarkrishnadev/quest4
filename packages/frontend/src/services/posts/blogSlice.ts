import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BlogCreateRequest,
    BlogDeleteRequest,
    BlogModel,
    BlogResponse,
    BlogUpdateRequest,
} from "./types";
import type { RootState } from "../../store";
import type { ErrorResponse } from "../error-types";

// Define our service using a base URL and expected endpoints
export const blogApi = createApi({
    reducerPath: "blogApi",
    // Replace `localhost` with your cloud address if needed
    baseQuery: fetchBaseQuery({
        baseUrl: "https://studious-guide-x6rr6r5px7rhp756-4040.app.github.dev/api/",
        prepareHeaders: (headers, { getState, endpoint }) => {
            const token = (getState() as RootState).auth.token;
            // Only set authorization headers for specific endpoints
            if (token && endpoint !== "posts/all" && !endpoint.startsWith("posts/user")) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    tagTypes: ["BlogModel"],
    refetchOnFocus: true,  // Enable refetch on window focus
    refetchOnReconnect: true,  // Enable refetch on network reconnect
    endpoints: (builder) => ({
        getAllBlogPosts: builder.query<BlogModel[], void>({
            query: () => ({
                url: "posts/all",
            }),
            transformResponse: (response: { posts: BlogModel[] }) => response.posts,
            transformErrorResponse: (response) => response.data as ErrorResponse,
            providesTags: ["BlogModel"],
        }),
        getBlogPostsByUsername: builder.query<BlogModel[], string>({
            query: (user) => `posts/user/${user}`,
            transformResponse: (response: { posts: BlogModel[] }) => response.posts,
            transformErrorResponse: (response) => response.data as ErrorResponse,
            providesTags: ["BlogModel"],
        }),
        createPost: builder.mutation<BlogResponse, BlogCreateRequest>({
            query: (body) => ({
                url: "posts/post/create",
                method: "POST",
                credentials: "include",
                body: body,
            }),
            invalidatesTags: ["BlogModel"],  // Invalidate cache on post creation
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
        deletePost: builder.mutation<BlogResponse, BlogDeleteRequest>({
            query: (body) => ({
                url: "posts/post/delete",
                method: "DELETE",
                credentials: "include",
                body: { id: body.id, title: body.title },
            }),
            invalidatesTags: ["BlogModel"],  // Invalidate cache on post deletion
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
        updatePost: builder.mutation<BlogResponse, BlogUpdateRequest>({
            query: (body) => ({
                url: "posts/post/update",
                method: "PUT",
                credentials: "include",
                body: body,
            }),
            invalidatesTags: ["BlogModel"],  // Invalidate cache on post update
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
    }),
});

// Exporting the generated hooks for use in components
export const {
    useLazyGetAllBlogPostsQuery,
    useLazyGetBlogPostsByUsernameQuery,
    useGetAllBlogPostsQuery,
    useGetBlogPostsByUsernameQuery,
    useCreatePostMutation,
    useDeletePostMutation,
    useUpdatePostMutation,
} = blogApi;
