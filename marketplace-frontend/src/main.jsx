import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { fetchMe } from './store/slices/authSlice'
import { fetchProducts } from './store/slices/catalogSlice'
import { getToken } from './lib/api'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App.jsx'
import './index.css'

// Restore session + warm the public catalog
if (getToken()) {
  store.dispatch(fetchMe())
}
store.dispatch(fetchProducts())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
)
