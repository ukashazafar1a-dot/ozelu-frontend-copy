import React from 'react'
import dynamic from 'next/dynamic';
import SectionLoader from '@/components/Loader/SectionLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Cart - Ozelu Studio",
  description: "Cart Page - Ozelu Studio Blog",
  alternates: {
    canonical: '/cart',
  },
  robots: {
    index: false,
    follow: false,
    nocache: false,
  }
};

const page = () => {
  const Index: any = dynamic(() => import("@/screens/Cart/Index"), {
    loading: () => <SectionLoader />,
    ssr: false,
  });
  return (
    <div>
      <Index/>
    </div>
  )
}

export default page