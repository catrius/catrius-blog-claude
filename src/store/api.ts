import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '../lib/supabase'
import type { Tables } from '../types/database'

type Post = Tables<'post'>
type Category = Tables<'category'>
type Page = Tables<'page'>

export const PAGE_SIZE = 12

interface PostsResponse {
  posts: Post[]
  hasMore: boolean
}

interface PostsQueryArgs {
  offset: number
  limit: number
  categoryId?: number | null
}

export const api = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Post', 'Category', 'Page'],
  endpoints: (builder) => ({
    getPosts: builder.query<PostsResponse, PostsQueryArgs>({
      queryFn: async ({ offset, limit, categoryId }) => {
        let query = supabase
          .from('post')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (categoryId != null) {
          query = query.eq('category_id', categoryId)
        }

        const { data, error } = await query
        if (error) return { error }
        return { data: { posts: data, hasMore: data.length === limit } }
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return { categoryId: queryArgs.categoryId ?? null }
      },
      merge: (currentCache, newItems) => {
        const existingIds = new Set(currentCache.posts.map((p) => p.id))
        const uniqueNewItems = newItems.posts.filter(
          (p) => !existingIds.has(p.id),
        )
        currentCache.posts.push(...uniqueNewItems)
        currentCache.hasMore = newItems.hasMore
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return currentArg?.offset !== previousArg?.offset
      },
      providesTags: (result) =>
        result
          ? [
              ...result.posts.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostCounts: builder.query<
      { countsByCategory: Record<number, number>; total: number },
      void
    >({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('post')
          .select('category_id')

        if (error) return { error }
        const countsByCategory: Record<number, number> = {}
        for (const { category_id } of data) {
          if (category_id != null) {
            countsByCategory[category_id] =
              (countsByCategory[category_id] ?? 0) + 1
          }
        }
        return { data: { countsByCategory, total: data.length } }
      },
      providesTags: [{ type: 'Post', id: 'LIST' }],
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

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useGetCategoriesQuery,
  useGetPostCountsQuery,
  useGetPagesQuery,
  useGetPageQuery,
} = api
