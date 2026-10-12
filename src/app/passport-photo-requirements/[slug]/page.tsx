import { getData } from "@/helpers/generals";
import PassSizeDetails from "@/screens/PassportSizeDetails/Index";
import { notFound } from "next/navigation";
import React from "react";

export const runtime = "edge";
const sectionSlug = "passport-photo-requirements";

const getDataPage = async function (slug: any) {
  try {
    const data = await fetch(
      process.env.NEXT_PUBLIC_API_URL +
        "/api/assets/photo-requirements-pages/" +
        slug,
      { next: { revalidate: 60 } }
    );
    const response = await data.json();
    if (response?.status) {
      return response;
    }
    return notFound();
  } catch (error) {
    return null;
  }
};

export async function generateMetadata({ params }: any) {
  try {
    const slug = params?.slug;
    const result = await getDataPage(slug);
    //console.log(result)
    if (!result || !slug) {
      return {};
    }
    const { page } = result;
    const title = `${page.page_title ? page.page_title : slug}`;
    const desc = `${page.meta_description ? page.meta_description : ""}`;
    const URL = `/${sectionSlug}/${slug}`;
    return {
      title,
      description: desc,
      alternates: {
        canonical: URL,
      },
      openGraph: {
        title,
        description: desc,
        url: URL,
        images: {
          url: page?.before_image?.src
            ? page?.before_image?.src
            : "https://res.cloudinary.com/dq83xons7/image/upload/v1704031083/assets/ozelu_offical_logo.png",
        },
      },
    };
  } catch (error: any) {
    return;
  }
}

const page = async ({ params }: any) => {
  const { page } = await getDataPage(params?.slug);
  const data = await getData("passport-photo-requirements");
  if (!page || !data) return notFound();
  return <PassSizeDetails content={page} data={data} />;
};

export default page;
