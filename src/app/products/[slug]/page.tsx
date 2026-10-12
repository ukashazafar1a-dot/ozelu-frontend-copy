import React from "react";
import { notFound } from "next/navigation";
import Index from "@/screens/ProductPage/Index";

export const runtime = "edge";

const getData = async (slug: any) => {
  try {
    const data = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/api/assets/products/" + slug,
      {
        next: {
          revalidate: 5,
        },
      }
    );
    if (!data?.ok) {
      return null;
    }
    const result = await data.json();
    return result;
  } catch (error) {
    return null;
  }
};

export async function generateMetadata({ params }: any) {
  // read route params
  const slug = params.slug;
  const result = await getData(slug);
  if (!result?.product || !slug) {
    return {};
  }
  const { product } = result;
  const title = `${product.page_title ? product.page_title : slug}`;
  const desc = `${product.meta_description ? product.meta_description : ""}`;
  const URL = `/products/${product?.slug ? product?.slug : slug}`;
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
      images: [
        {
          url: product?.featured_image
            ? product?.featured_image
            : `https://res.cloudinary.com/dq83xons7/image/upload/v1704031083/assets/ozelu_offical_logo.png`,
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

const page = async ({ params }: any) => {
  const result = await getData(params?.slug);
  if (!result?.product) {
    notFound();
  }
  return <Index product={result.product} />;
};

export default page;
