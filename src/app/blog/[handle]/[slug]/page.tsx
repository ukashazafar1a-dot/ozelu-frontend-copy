
import { Site } from "@/libs/site";
import ArticlePage from "@/screens/Blog/ArticlePage";
import React from "react";

const SITE_NAME = 'Blog';
export const runtime = 'edge';
const slug = 'blog';

const getData = async function (slug: any) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assets/blog/${slug}`,{ 
        next: {
          revalidate: 60
        }
       });
    if (!res.status) {
      console.log("Failed to fetch data");
    }
    return await res.json();
  } catch (error: any) {
    console.log("Failed to fetch data", error);
    return null;
  }
};

export async function generateMetadata({ params }: any) {
  try {
    const { blog } = await getData(params?.slug);
    //console.log(blog);
    if (!blog) return null;
    const title = blog?.page_title ? blog?.page_title : SITE_NAME;
    const description = blog?.meta_description ? blog?.meta_description : SITE_NAME;
    const URL = `${Site?.url}/blog/${blog?.slug ? blog?.slug : ''}`;
    return {
      title,
      description,
      alternates: {
        canonical: URL,
      },
      openGraph: {
        title,
        description,
        url: URL ,
        images: {
          url: blog?.featured_image?.src
            ? blog?.featured_image?.src
            : Site?.logo,
        },
      },
    };
  } catch (error: any) {
    return
  }
}

const page = async ({ params }: any) => {
  const result = await getData(params?.slug);
  //console.log(result)
  return <ArticlePage content={result} />;
};

export default page;
