import React from "react";
import CollectionsGrid from "@/screens/CollectionsGrid/Index";
import { getData } from "@/helpers/getData";

export const runtime = "edge";
const SITE_NAME = 'All Collections';
const slug = 'collectionspage';

export async function generateMetadata({ params }: any) {
  try {
    const {data} = await getData(slug);
    //console.log(data);
    if (!data) return
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description ? data?.meta_description : SITE_NAME;
    const URL = `/collections`;
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

const page = async () => {
  const data = await getData('collectionspage');
  //console.log('data',data);
  return <CollectionsGrid data={data ? data?.data : null} />;
};

export default page;
