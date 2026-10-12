import { getData } from "@/helpers/generals";
import React from "react";
import MenuPrintingPage from "./_components/MenuPrintingPage";

const SITE_NAME = "Menu Printing";
export const runtime = "edge";
const settingsSlug = "menu-printing";

// Treats blank, JS `undefined`, or the string "undefined"/"null" (which can
// leak in from FormData stringification) as a missing value so the SITE_NAME
// fallback shows up instead of literally rendering "undefined".
const isUsableText = (value: any) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 && trimmed !== "undefined" && trimmed !== "null";
};

export async function generateMetadata({ params }: any) {
  try {
    const { data } = await getData(settingsSlug);
    if (!data) return;
    const title = isUsableText(data?.page_title) ? data.page_title : SITE_NAME;
    const description = isUsableText(data?.meta_description)
      ? data.meta_description
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
  return (
    <MenuPrintingPage
      sections={data?.settings?.sections}
      data={data?.data}
    />
  );
};

export default page;
