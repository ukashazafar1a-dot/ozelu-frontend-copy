import Link from 'next/link'
import React from 'react'

const ErrorUi = () => {
  return (
    <div className="text-center p-5 my-5">
      <h2 className="mb-3">Something went wrong!</h2>
      <Link href={'/'} className="btn btn-info btn--primary">
        Try again
      </Link>
    </div>
  )
}

export default ErrorUi