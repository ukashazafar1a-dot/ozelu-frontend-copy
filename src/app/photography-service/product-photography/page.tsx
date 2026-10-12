import { getData } from '@/helpers/generals';
import ProductPhotographyPage from '@/screens/PhotographyServices/ProductPhotogrphy'
import { Metadata } from 'next';
import React from 'react'

const SITE_NAME = "Product Photography";
export const runtime = "edge";
const slug = "product-photography";
const parent = 'photography-service';


export async function generateMetadata({ params }: any) {
  try {
    const { data }: any = await getData(slug);
    //console.log(data);
    if (!data) return;
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description
      ? data?.meta_description
      : SITE_NAME;
      const URL = `/${parent}/${slug}`;
    return {
      title,
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


const page = async () => {
  const result = await getData(slug);
  //console.log(result)
  return (
    <>
     <ProductPhotographyPage content={result?.settings?.sections} />
    </>
  )
}

export default page