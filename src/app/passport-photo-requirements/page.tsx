import { getData } from "@/helpers/generals";
import PassportPhotoReqPage from "@/screens/PassportPhotoRequirements";
import React from "react";

const SITE_NAME = "Passport Photo Requirements";
export const runtime = "edge";
const slug = "passport-photo-requirements";

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
    return;
  }
}

const page = async () => {
  const data = await getData(slug);
  //console.log(data);
  return (
    <div>
      <PassportPhotoReqPage content={data} />
    </div>
  );
};

export default page;
