import { GoogleMapsEmbed } from '@next/third-parties/google'
import React from 'react'

const FooterMap = () => {
  return (
    <GoogleMapsEmbed
      apiKey="XYZ"
      height={200}
      width="100%"
      mode="place"
      q="Brooklyn+Bridge,New+York,NY"
    />
  )
}

export default FooterMap