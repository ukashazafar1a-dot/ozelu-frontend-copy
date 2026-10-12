import React, { Suspense } from "react";
import Index from "@/screens/CollectionPage/Index";
import { notFound } from "next/navigation";
import SectionLoader from "@/components/Loader/SectionLoader";
import { baseURL } from "@/libs/utils";

export const runtime = "edge";
export const revalidate = 0;

const getData = async function (slug: any, params: any) {
  try {
    const apiURl = `${baseURL}/api/assets/collections/${slug}?${params}`;
    const data = await fetch(apiURl);
    const result = await data.json();
    //console.log(result)
    if (!result?.status) {
      return notFound();
    }
    return result;
  } catch (error) {
    return notFound();
  }
};

function getQueryParams(values: any) {
  const { slug, ...filteredParams }: any = values;
  const filters: any = new URLSearchParams();
  Object.entries(filteredParams).forEach(([key, value]) => {
    filters.append(key, value);
  });
  return filters;
}

export async function generateMetadata({ params }: any) {
  try {
    const slug = params.slug;
    const result = await getData(slug, "");
    //console.log("Result",result)
    const { collection } = result;
    if (!result || !slug) {
      return {};
    }
    const title = `${collection.page_title ? collection.page_title : slug}`;
    const desc = `${
      collection.meta_description ? collection.meta_description : ""
    }`;
    const URL = `/collections/${collection?.slug ? collection?.slug : slug}`;
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
      },
    };
  } catch (error) {
    console.log(error);
    return;
  }
}

async function page({ params, searchParams }: any) {
  //console.log('params',params,'search params',searchParams)
  let queryParams = getQueryParams(searchParams);
  //console.log(queryParams);
  const data = await getData(params?.slug, queryParams);
  //console.log(data);
  return (
    <Suspense fallback={<SectionLoader />}>
      <Index data={data} />
    </Suspense>
  );
}
export default page;
