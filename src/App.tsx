import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import PostDetail from './pages/PostDetail'

function App() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories/:categorySlug" element={<Home />} />
        <Route path="/posts/:slug" element={<PostDetail />} />
      </Routes>
    </div>
  )
}

export default App
