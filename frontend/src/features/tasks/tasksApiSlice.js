import { apiSlice } from '../api/apiSlice';

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getTasks: builder.query({
      query: (projectId) => {
        let url = '/tasks';
        if (projectId) {
          url += `?project=${projectId}`;
        }
        return url;
      },
      providesTags: ['Task']
    }),
    createTask: builder.mutation({
      query: taskData => ({
        url: '/tasks',
        method: 'POST',
        body: taskData
      }),
      invalidatesTags: ['Task', 'Dashboard']
    }),
    updateTaskStatus: builder.mutation({
      query: ({ taskId, status }) => ({
        url: `/tasks/${taskId}`,
        method: 'PATCH',
        body: { status }
      }),
      invalidatesTags: ['Task', 'Dashboard']
    })
  })
});

export const { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation } = tasksApiSlice;
