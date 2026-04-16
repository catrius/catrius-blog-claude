import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type Post = Tables<'post'>
type Category = Tables<'category'>
type Page = Tables<'page'>

export const api = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Post', 'Category', 'Page'],
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPost: builder.query<Post, string>({
      queryFn: async (slug) => {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result ? [{ type: 'Post', id: result.id }] : [],
    }),

    getCategories: builder.query<Category[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('category')
          .select('*')
          .order('name')

        if (error) return { error }
        return { data }
      },
      providesTags: ['Category'],
    }),

    getPages: builder.query<Page[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('page')
          .select('*')
          .order('title')

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Page' as const, id })),
              { type: 'Page', id: 'LIST' },
            ]
          : [{ type: 'Page', id: 'LIST' }],
    }),

    getPage: builder.query<Page, string>({
      queryFn: async (slug) => {
        const { data, error } = await supabase
          .from('page')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result ? [{ type: 'Page', id: result.id }] : [],
    }),
  }),
})

export const { useGetPostsQuery, useGetPostQuery, useGetCategoriesQuery, useGetPagesQuery, useGetPageQuery } = api
