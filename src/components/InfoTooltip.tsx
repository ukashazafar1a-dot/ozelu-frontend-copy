import InfoIcon from '@/assets/icons/InfoIcon'
import Tippy from '@tippyjs/react'
import React from 'react'

function InfoTooltip({ content, className }: { content: string; className?: string }) {
  return (
    <Tippy content={content}>
        <span className={className} style={{ marginLeft: '0.6rem' }}>
            <InfoIcon width={'1.2rem'}/>
        </span>
    </Tippy>
  )
}

export default InfoTooltip