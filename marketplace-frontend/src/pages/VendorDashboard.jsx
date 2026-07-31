import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Lock, PlusCircle, Wallet, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PageBackdrop from '@/components/PageBackdrop'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'

export default function VendorDashboard() {
  const user = useSelector((s) => s.auth.user)
  const verified = user?.vendorVerificationStatus === 'verified'

  const actions = [
    { icon: PlusCircle, label: 'Add a product', locked: !verified },
    { icon: Wallet, label: 'View payouts', locked: !verified },
    { icon: Package, label: 'Manage orders', locked: !verified },
  ]

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10">
        <h1 className="font-display text-3xl font-semibold mb-1">
          {user?.vendorEligibility?.businessName || 'Your shop'}
        </h1>
        <div className="flex items-center gap-2 mb-8">
          <span
            className={cn(
              'text-xs font-medium px-2.5 py-1 rounded-full',
              verified ? 'bg-emerald/15 text-emerald' : 'bg-amber/15 text-amber',
            )}
          >
            {verified ? 'Verified vendor' : 'Verification pending'}
          </span>
        </div>

        {!verified && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber/10 border border-amber/25 text-onLight/70 text-sm rounded-2xl p-5 mb-8 max-w-xl"
          >
            Your application is still under review. You can explore the dashboard shell below, but
            listing products and accessing payouts stay locked until you're verified.
          </motion.div>
        )}

        <Reveal className="grid sm:grid-cols-3 gap-5">
          {actions.map((a) => (
            <div
              key={a.label}
              title={a.locked ? "Unlocks once you're verified" : undefined}
              className={cn(
                'p-6 rounded-2xl border bg-white flex flex-col items-start gap-4',
                a.locked ? 'opacity-50 border-onLight/10 cursor-not-allowed' : 'border-onLight/10 hover:border-leaf/40 cursor-pointer',
              )}
            >
              <div className="flex items-center justify-between w-full">
                <a.icon size={22} className="text-leaf" />
                {a.locked && <Lock size={14} className="text-onLight/35" />}
              </div>
              <span className="text-sm font-medium">{a.label}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </PageBackdrop>
  )
}
