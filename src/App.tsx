import { Routes, Route } from 'react-router'
import PostList from './pages/PostList'
import PostDetail from './pages/PostDetail'

function App() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/posts/:id" element={<PostDetail />} />
      </Routes>
    </div>
  )
}

export default App
