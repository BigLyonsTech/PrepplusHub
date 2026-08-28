import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export default function RequireAuth({ children }) {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }
  return children
}
