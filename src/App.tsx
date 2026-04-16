import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'
import PageDetail from './pages/PageDetail'
import Header from './components/Header'
import Footer from './components/Footer'

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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
