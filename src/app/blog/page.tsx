
import React from "react";
import { getData } from "@/helpers/generals";
import BlogPage from "@/screens/Blog";
import { Site } from "@/libs/site";


const SITE_NAME = 'Blog';
export const runtime = 'edge';
const slug = 'blog';

export async function generateMetadata({ params }: any) {
  try {
    const {data} = await getData(slug);
    //console.log(data);
    if (!data) return
    const title = data?.page_title ? data?.page_title : SITE_NAME;
    const description = data?.meta_description ? data?.meta_description : SITE_NAME;
    const URL = `${Site?.url}/blog`;
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
    return
  }
}
const getBlogs = async function () {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assets/blogs`,{ 
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


// /api/assets/blog/handle
// /api/assets/blogs
// /api/assets/blogs/categories

const page = async () => {
  const result = await getBlogs();
  const data = await getData(slug);
  //console.log('result',result)
  return <BlogPage articles={result} content={data} />;
};

export default page;
