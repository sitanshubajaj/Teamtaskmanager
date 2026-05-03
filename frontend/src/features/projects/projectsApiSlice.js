import { apiSlice } from '../api/apiSlice';

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project']
    }),
    createProject: builder.mutation({
      query: projectData => ({
        url: '/projects',
        method: 'POST',
        body: projectData
      }),
      invalidatesTags: ['Project']
    })
  })
});

export const { useGetProjectsQuery, useCreateProjectMutation } = projectsApiSlice;
