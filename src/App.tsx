import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import Home from '@/pages/Home';
import Search from '@/pages/Search';
import TagsIndex from '@/pages/TagsIndex';
import TagPosts from '@/pages/TagPosts';
import PostDetail from '@/pages/PostDetail';
import PageDetail from '@/pages/PageDetail';
import LikedPosts from '@/pages/LikedPosts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminRoute from '@/components/AdminRoute';

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'));
const AdminPostNew = lazy(() => import('@/pages/admin/AdminPostNew'));
const AdminPostEdit = lazy(() => import('@/pages/admin/AdminPostEdit'));
const AdminPages = lazy(() => import('@/pages/admin/AdminPages'));
const AdminPageNew = lazy(() => import('@/pages/admin/AdminPageNew'));
const AdminPageEdit = lazy(() => import('@/pages/admin/AdminPageEdit'));

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.2,
  ease: 'easeInOut' as const,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tags" element={<TagsIndex />} />
          <Route path="/tags/:tag" element={<TagPosts />} />
          <Route path="/categories/:categorySlug" element={<Home />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/pages/:slug" element={<PageDetail />} />
          <Route path="/likes" element={<LikedPosts />} />
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
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div
      className="
        flex min-h-screen flex-col bg-white
        dark:bg-gray-950 dark:text-gray-100
      "
    >
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <AnimatedRoutes />
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
