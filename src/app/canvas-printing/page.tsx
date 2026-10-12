import React from "react";
import { getData } from "@/helpers/getData";
import CanvasPrintingPage from "./_components/CanvasPrintingPage";


const SITE_NAME = "Canvas Printing";
export const runtime = "edge";
const slug = "canvas-printing";

export async function generateMetadata({ params }: any) {
  try {
    const { data } = await getData(slug);
    //console.log(data);
    if (!data) return;
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description
      ? data?.meta_description
      : SITE_NAME;
    const URL = `/${slug}`;
    return {
      title,
      description,
      alternates: {
        canonical: URL,
      },
      openGraph: {
        title,
        description,
        url: URL,
      },
    };
  } catch (error: any) {
    console.log("Failed to fetch data", error);
  }
}

const page = async () => {
  const data = await getData(slug);
  //console.log(data)
  return <CanvasPrintingPage sections={data?.settings?.sections} data={data?.data}/>;
};

export default page;
