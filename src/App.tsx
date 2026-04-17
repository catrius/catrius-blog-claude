import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import PageDetail from './pages/PageDetail'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminPostNew = lazy(() => import('./pages/admin/AdminPostNew'))
const AdminPostEdit = lazy(() => import('./pages/admin/AdminPostEdit'))

function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
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
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
