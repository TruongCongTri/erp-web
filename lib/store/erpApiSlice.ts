import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import { 
  tableQueryStrategy, 
  pollingQueryStrategy, 
  crudMutationStrategy,
  infiniteScrollStrategy 
} from '@/lib/api/client-strategies';
import { ERP_TAGS } from '../api/tags';

export const erpApiSlice = createApi({
  reducerPath: 'erpApi',
  baseQuery: baseQueryWithReauth,
  
  // Use the array from tags.ts to guarantee type matching
  tagTypes: ERP_TAGS,
  
  endpoints: (builder) => ({
    
    getEmployeesTable: builder.query(
      tableQueryStrategy('/employees', ['Employees'])
    ),

    softDeleteEmployee: builder.mutation(
      crudMutationStrategy((id: string) => `/employees/${id}`, 'PATCH', ['Employees'])
    ),

    createEmployee: builder.mutation(
      crudMutationStrategy(() => `/employees`, 'POST', ['Employees'])
    ),

    // FIXED: Pass the strategy directly. No need for .query
    getLiveAttendance: builder.query(
      pollingQueryStrategy('/hr/attendance/live', 300000)
    ),

    getNewsfeed: builder.query(
      infiniteScrollStrategy('/newsfeed')
    )
  }),
});

export const {
  useGetEmployeesTableQuery,
  useSoftDeleteEmployeeMutation,
  useCreateEmployeeMutation,
  useGetLiveAttendanceQuery,
  useGetNewsfeedQuery,
} = erpApiSlice;