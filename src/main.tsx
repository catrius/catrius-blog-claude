import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import '@/index.css'
import App from '@/App.tsx'
import { store } from '@/store/store.ts'
import { AuthProvider } from '@/lib/AuthContext.tsx'
import { ThemeProvider } from '@/lib/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
