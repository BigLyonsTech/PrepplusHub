import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageBackdrop from '@/components/PageBackdrop'
import Reveal from '@/components/Reveal'
import { fetchVendorPayouts } from '@/store/slices/catalogSlice'

export default function VendorPayoutsPage() {
  const dispatch = useDispatch()
  const { earned, paidOut, balance, payouts } = useSelector((s) => s.catalog.vendorPayouts)
  const status = useSelector((s) => s.catalog.vendorPayoutsStatus)
  const error = useSelector((s) => s.catalog.vendorPayoutsError)

  useEffect(() => {
    dispatch(fetchVendorPayouts())
  }, [dispatch])

  return (
    <PageBackdrop>
      <Navbar />
      <div className="container-page py-10">
        <Reveal>
          <h1 className="font-display text-3xl font-semibold mb-1">Payouts</h1>
          <p className="text-onLight/50 text-sm mb-8">
            Earnings from delivered orders, and what's already been paid out to you.
          </p>
        </Reveal>

        {status === 'loading' ? (
          <p className="text-sm text-onLight/45">Loading your payouts…</p>
        ) : status === 'failed' ? (
          <div>
            <p className="text-sm text-coral mb-2">{error || "Couldn't load your payouts."}</p>
            <button
              onClick={() => dispatch(fetchVendorPayouts())}
              className="text-xs font-medium bg-onLight/5 hover:bg-onLight/10 text-onLight/70 rounded-full px-4 py-2 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mb-10">
              <div className="bg-surface border border-onLight/10 rounded-2xl p-5">
                <div className="text-xs text-onLight/45 mb-1">Total earned</div>
                <div className="font-display text-xl font-semibold">₦{earned.toLocaleString()}</div>
              </div>
              <div className="bg-surface border border-onLight/10 rounded-2xl p-5">
                <div className="text-xs text-onLight/45 mb-1">Paid out</div>
                <div className="font-display text-xl font-semibold">₦{paidOut.toLocaleString()}</div>
              </div>
              <div className="bg-leaf/10 border border-leaf/25 rounded-2xl p-5">
                <div className="text-xs text-leaf/80 mb-1">Available balance</div>
                <div className="font-display text-xl font-semibold text-leaf">₦{balance.toLocaleString()}</div>
              </div>
            </div>

            <h2 className="font-display text-xl font-semibold mb-4">Payout history</h2>
            {payouts.length === 0 ? (
              <p className="text-sm text-onLight/45">
                No payouts yet. Earnings from delivered orders build up your balance above; the
                platform pays that out to you directly and records it here.
              </p>
            ) : (
              <div className="flex flex-col gap-3 max-w-2xl">
                {payouts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-surface border border-onLight/10 rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium text-sm">₦{p.amount.toLocaleString()}</div>
                      {p.note && <div className="text-xs text-onLight/45 mt-0.5">{p.note}</div>}
                    </div>
                    <div className="text-xs text-onLight/35 shrink-0">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </PageBackdrop>
  )
}
