
import React from 'react';
import CheckoutPage from '@/screens/Checkout/CheckoutPage'
import { getData } from '@/helpers/generals';

const settingsSlug = "checkout";
const SITE_NAME = "Checkout";
export const runtime = "edge";

export async function generateMetadata({ params }: any) {
  try {
    const { data } = await getData(settingsSlug);
    //console.log(data);
    if (!data) return;
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description
      ? data?.meta_description
      : SITE_NAME;
    const URL = `/checkout`;
    return {
      title,
      description,
      alternates: {
        canonical: URL,
      },
      robots: {
        index: false,
        follow: false,
        nocache: false,
      }
    };
  } catch (error: any) {
    console.log("Failed to fetch data", error);
  }
}

const page = async () => {
  const data = await getData(settingsSlug);
  return <CheckoutPage data={data?.data}/>;
}

export default page