import { useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import Button from '@/components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-32 text-center flex flex-col items-center">
        <span className="font-display text-7xl font-semibold text-onLight/15 mb-4">404</span>
        <h1 className="font-display text-3xl font-semibold mb-3">Page not found</h1>
        <p className="text-onLight/50 mb-8 max-w-sm">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="lg" onClick={() => navigate('/')}>
            Back to home
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/products')}>
            Browse products
          </Button>
        </div>
      </div>
      <Footer />
    </PageBackdrop>
  )
}
