import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google'
import React from 'react'

const Analytics = () => {
  const gtmId = process.env.NEXT_PUBLIC_GTM
  const gaId = process.env.NEXT_PUBLIC_GA
  return (
    <>
      {gtmId ? <GoogleTagManager gtmId={gtmId} /> : null}
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </>
  )
}

export default Analytics