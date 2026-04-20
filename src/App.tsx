import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Home from '@/pages/Home'
import Search from '@/pages/Search'
import TagsIndex from '@/pages/TagsIndex'
import TagPosts from '@/pages/TagPosts'
import PostDetail from '@/pages/PostDetail'
import PageDetail from '@/pages/PageDetail'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AdminRoute from '@/components/AdminRoute'

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'))
const AdminPostNew = lazy(() => import('@/pages/admin/AdminPostNew'))
const AdminPostEdit = lazy(() => import('@/pages/admin/AdminPostEdit'))
const AdminPages = lazy(() => import('@/pages/admin/AdminPages'))
const AdminPageNew = lazy(() => import('@/pages/admin/AdminPageNew'))
const AdminPageEdit = lazy(() => import('@/pages/admin/AdminPageEdit'))

function App() {
  return (
    <div className="
      flex min-h-screen flex-col bg-white
      dark:bg-gray-950 dark:text-gray-100
    ">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tags" element={<TagsIndex />} />
          <Route path="/tags/:tag" element={<TagPosts />} />
          <Route path="/categories/:categorySlug" element={<Home />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/pages/:slug" element={<PageDetail />} />
          <Route element={<AdminRoute />}>
            <Route
              path="/admin"
              element={
                <Suspense fallback={null}>
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <Suspense fallback={null}>
                  <AdminPosts />
                </Suspense>
              }
            />
            <Route
              path="/admin/posts/new"
              element={
                <Suspense fallback={null}>
                  <AdminPostNew />
                </Suspense>
              }
            />
            <Route
              path="/admin/posts/:id/edit"
              element={
                <Suspense fallback={null}>
                  <AdminPostEdit />
                </Suspense>
              }
            />
            <Route
              path="/admin/pages"
              element={
                <Suspense fallback={null}>
                  <AdminPages />
                </Suspense>
              }
            />
            <Route
              path="/admin/pages/new"
              element={
                <Suspense fallback={null}>
                  <AdminPageNew />
                </Suspense>
              }
            />
            <Route
              path="/admin/pages/:id/edit"
              element={
                <Suspense fallback={null}>
                  <AdminPageEdit />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  )
}

export default App
