import { apiSlice } from '../api/apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['User']
    })
  })
});

export const { useGetUsersQuery } = usersApiSlice;
