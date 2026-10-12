import { getData } from "@/helpers/generals";
import React from "react";
import GreetingCardsPrintingPage from "./_components/GreetingCardsPrintingPage";

const SITE_NAME = "Greeting Cards Printing";
export const runtime = "edge";
const settingsSlug = "greeting-cards-printing";

export async function generateMetadata({ params }: any) {
  try {
    const { data } = await getData(settingsSlug);
    //console.log(data);
    if (!data) return;
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description
      ? data?.meta_description
      : SITE_NAME;
    const URL = `/${settingsSlug}`;
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
  const data = await getData(settingsSlug);
  return <GreetingCardsPrintingPage sections={data?.settings?.sections} data={data?.data} />;
};

export default page;
