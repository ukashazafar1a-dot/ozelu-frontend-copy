import React from 'react'
import Index from '@/screens/PassportSizePhotos/Index'
import { getData } from '@/helpers/generals';

const SITE_NAME = 'Passport Size Photos';
export const runtime = 'edge';
const slug = 'passport-size-photos';

export async function generateMetadata({ params }: any) {
  try {
    const {data} = await getData(slug);
    if (!data) return
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description ? data?.meta_description : SITE_NAME;
    const URL = `/${slug}`;
    return {
      title ,
      description,
      alternates: {
        canonical: URL,
      },
      openGraph: {
        title,
        description,
        url:URL
      },
    };
  } catch (error: any) {
    console.log("Failed to fetch data", error);
  }
}

const PassportSizePhotoDelivery = async () => {
  const data = await getData(slug);
  return (
    <div>
      <Index content={data} />
    </div>
  )
}

export default PassportSizePhotoDelivery
