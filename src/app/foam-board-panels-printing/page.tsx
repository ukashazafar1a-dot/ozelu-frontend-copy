import React from "react";
import FoamBoardPage from "./_components/FoamBoardPage";
import { getData } from "@/helpers/generals";

const SITE_NAME = "Foam Board Panels";
export const runtime = "edge";
const settingsSlug = "foam-board-panels";

export async function generateMetadata({ params }: any) {
  try {
    const { data } = await getData(settingsSlug);
    //console.log(data);
    if (!data) return;
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description
      ? data?.meta_description
      : SITE_NAME;
    const URL = `/foam-board-panels-printing`;
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
  //console.log(data)
  return <FoamBoardPage sections={data?.settings?.sections} data={data?.data}/>;
};

export default page;
