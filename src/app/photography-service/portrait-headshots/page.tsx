import React from 'react'
import Index from '@/screens/PhotographyServices/PortraitHeadshots/Index'
import { getData } from '@/helpers/generals';


const SITE_NAME = 'Portrait Headshots';
export const runtime = 'edge';
const slug = 'portrait-headshots';
const parent = 'photography-service';

export async function generateMetadata({ params }: any) {
  try {
    const {data}:any = await getData(slug);
    //console.log(data);
    if (!data) return
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description ? data?.meta_description : SITE_NAME;
    const URL = `/${parent}/${slug}`;
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

const Page = async() => {
  const result = await getData(slug);
  //console.log(result)
  return (<Index content={result?.settings?.sections}/>)
}

export default Page