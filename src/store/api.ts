import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { supabase } from '@/lib/supabase'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'

type Post = Tables<'post'>
type Category = Tables<'category'>
type Page = Tables<'page'>
type Comment = Tables<'comment'>
type PostInsert = TablesInsert<'post'>
type PostUpdate = TablesUpdate<'post'>
type PageInsert = TablesInsert<'page'>
type PageUpdate = TablesUpdate<'page'>
type CommentInsert = TablesInsert<'comment'>

interface LikeStatus {
  count: number
  likedByUser: boolean
}

interface LikeStatusArgs {
  postId: number
  userId: string | null
}

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

interface SearchPostsArgs {
  query: string
  offset: number
  limit: number
}

interface TagPostsArgs {
  tag: string
  offset: number
  limit: number
}

interface RelatedPostsArgs {
  postId: number
  tags: string[]
  maxResults?: number
}

export const api = createApi({
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Post', 'Category', 'Page', 'Comment', 'Like'],
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

    searchPosts: builder.query<PostsResponse, SearchPostsArgs>({
      queryFn: async ({ query, offset, limit }) => {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .textSearch('fts', query, { type: 'websearch' })
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) return { error }
        return { data: { posts: data, hasMore: data.length === limit } }
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return { query: queryArgs.query }
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
              { type: 'Post', id: 'SEARCH' },
            ]
          : [{ type: 'Post', id: 'SEARCH' }],
    }),

    getPostsByTag: builder.query<PostsResponse, TagPostsArgs>({
      queryFn: async ({ tag, offset, limit }) => {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .contains('tags', [tag])
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) return { error }
        return { data: { posts: data, hasMore: data.length === limit } }
      },
      serializeQueryArgs: ({ queryArgs }) => {
        return { tag: queryArgs.tag }
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

    getAllTags: builder.query<{ tag: string; count: number }[], void>({
      queryFn: async () => {
        const { data, error } = await supabase.from('post').select('tags')
        if (error) return { error }

        const counts = new Map<string, number>()
        for (const row of data) {
          for (const tag of row.tags) {
            counts.set(tag, (counts.get(tag) ?? 0) + 1)
          }
        }

        const tags = Array.from(counts.entries())
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))

        return { data: tags }
      },
      providesTags: [{ type: 'Post', id: 'LIST' }],
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

    getRelatedPosts: builder.query<Post[], RelatedPostsArgs>({
      queryFn: async ({ postId, tags, maxResults = 3 }) => {
        const { data, error } = await supabase.rpc('related_posts', {
          p_id: postId,
          p_tags: tags,
          max_results: maxResults,
        })

        if (error) return { error }
        return { data: data as Post[] }
      },
      providesTags: (result) =>
        result
          ? result.map(({ id }) => ({ type: 'Post' as const, id }))
          : [],
    }),

    getPostById: builder.query<Post, number>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('post')
          .select('*')
          .eq('id', id)
          .single()

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result ? [{ type: 'Post', id: result.id }] : [],
    }),

    getAdminPosts: builder.query<Post[], void>({
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

    createPost: builder.mutation<Post, PostInsert>({
      queryFn: async (newPost) => {
        const { data, error } = await supabase
          .from('post')
          .insert(newPost)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, { id: number; changes: PostUpdate }>({
      queryFn: async ({ id, changes }) => {
        const { data, error } = await supabase
          .from('post')
          .update(changes)
          .eq('id', id)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    deletePost: builder.mutation<null, number>({
      queryFn: async (id) => {
        const { error } = await supabase.from('post').delete().eq('id', id)

        if (error) return { error }
        return { data: null }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    getPageById: builder.query<Page, number>({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from('page')
          .select('*')
          .eq('id', id)
          .single()

        if (error) return { error }
        return { data }
      },
      providesTags: (result) =>
        result ? [{ type: 'Page', id: result.id }] : [],
    }),

    getAdminPages: builder.query<Page[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('page')
          .select('*')
          .order('created_at', { ascending: false })

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

    createPage: builder.mutation<Page, PageInsert>({
      queryFn: async (newPage) => {
        const { data, error } = await supabase
          .from('page')
          .insert(newPage)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: [{ type: 'Page', id: 'LIST' }],
    }),

    updatePage: builder.mutation<Page, { id: number; changes: PageUpdate }>({
      queryFn: async ({ id, changes }) => {
        const { data, error } = await supabase
          .from('page')
          .update(changes)
          .eq('id', id)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
      ],
    }),

    deletePage: builder.mutation<null, number>({
      queryFn: async (id) => {
        const { error } = await supabase.from('page').delete().eq('id', id)

        if (error) return { error }
        return { data: null }
      },
      invalidatesTags: (_result, _error, id) => [
        { type: 'Page', id },
        { type: 'Page', id: 'LIST' },
      ],
    }),

    getComments: builder.query<Comment[], number>({
      queryFn: async (postId) => {
        const { data, error } = await supabase
          .from('comment')
          .select('*')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })

        if (error) return { error }
        return { data }
      },
      providesTags: (result, _error, postId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Comment' as const, id })),
              { type: 'Comment', id: `POST_${postId}` },
            ]
          : [{ type: 'Comment', id: `POST_${postId}` }],
    }),

    createComment: builder.mutation<Comment, CommentInsert>({
      queryFn: async (newComment) => {
        const { data, error } = await supabase
          .from('comment')
          .insert(newComment)
          .select()
          .single()

        if (error) return { error }
        return { data }
      },
      invalidatesTags: (_result, _error, { post_id }) => [
        { type: 'Comment', id: `POST_${post_id}` },
      ],
    }),

    deleteComment: builder.mutation<null, { id: number; postId: number }>({
      queryFn: async ({ id }) => {
        const { error } = await supabase
          .from('comment')
          .delete()
          .eq('id', id)

        if (error) return { error }
        return { data: null }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comment', id: `POST_${postId}` },
      ],
    }),

    getLikeStatus: builder.query<LikeStatus, LikeStatusArgs>({
      queryFn: async ({ postId, userId }) => {
        const { count, error } = await supabase
          .from('post_like')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId)

        if (error) return { error }

        let likedByUser = false
        if (userId) {
          const { data } = await supabase
            .from('post_like')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .maybeSingle()
          likedByUser = data !== null
        }

        return { data: { count: count ?? 0, likedByUser } }
      },
      providesTags: (_result, _error, { postId }) => [
        { type: 'Like', id: `POST_${postId}` },
      ],
    }),

    toggleLike: builder.mutation<
      null,
      { postId: number; userId: string; liked: boolean }
    >({
      queryFn: async ({ postId, userId, liked }) => {
        if (liked) {
          const { error } = await supabase
            .from('post_like')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', userId)
          if (error) return { error }
        } else {
          const { error } = await supabase
            .from('post_like')
            .insert({ post_id: postId, user_id: userId })
          if (error) return { error }
        }
        return { data: null }
      },
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Like', id: `POST_${postId}` },
        { type: 'Like', id: 'USER_LIST' },
      ],
    }),

    getUserLikedPosts: builder.query<Post[], string>({
      queryFn: async (userId) => {
        const { data: likes, error: likesError } = await supabase
          .from('post_like')
          .select('post_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (likesError) return { error: likesError }
        if (likes.length === 0) return { data: [] }

        const postIds = likes.map((l) => l.post_id)
        const { data: posts, error: postsError } = await supabase
          .from('post')
          .select('*')
          .in('id', postIds)

        if (postsError) return { error: postsError }

        const orderMap = new Map(postIds.map((id, i) => [id, i]))
        posts.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))

        return { data: posts }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Like', id: 'USER_LIST' },
            ]
          : [{ type: 'Like', id: 'USER_LIST' }],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostsByTagQuery,
  useGetAllTagsQuery,
  useSearchPostsQuery,
  useGetPostQuery,
  useGetRelatedPostsQuery,
  useGetCategoriesQuery,
  useGetPostCountsQuery,
  useGetPagesQuery,
  useGetPageQuery,
  useGetPostByIdQuery,
  useGetAdminPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetPageByIdQuery,
  useGetAdminPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
  useGetLikeStatusQuery,
  useToggleLikeMutation,
  useGetUserLikedPostsQuery,
} = api
