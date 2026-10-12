import React from "react";
import { Metadata } from "next";
import Index from "@/screens/CvTemplates/Index";
import { getData } from "@/helpers/generals";

const SITE_NAME = 'CV Templates';
export const runtime = 'edge';
const slug = 'cv-templates';


export async function generateMetadata({ params }: any) {
  try {
    const {data} = await getData(slug);
    //console.log(data);
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

const page = async() => {
  const data = await getData(slug);
  //console.log(data)
  return (
    <div><Index content={data}/></div>
  )
};

export default page;
