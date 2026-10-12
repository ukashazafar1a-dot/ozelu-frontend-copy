import { getData } from "@/helpers/generals";
import TShirtsPrintingPage from "./_components/TShirtsPrintingPage";

const SITE_NAME = "T-Shirts Printing";
export const runtime = "edge";
const settingsSlug = "t-shirts-printing";

export async function generateMetadata() {
  try {
    const { data } = await getData(settingsSlug);
    if (!data) return;
    const title = data?.page_title || SITE_NAME;
    const description = data?.meta_description || SITE_NAME;
    const URL = `/${settingsSlug}`;
    return {
      title,
      description,
      alternates: { canonical: URL },
      openGraph: { title, description, url: URL },
    };
  } catch (error) {
    console.log("Failed to fetch metadata", error);
  }
}

export default async function Page() {
  const data = await getData(settingsSlug);
  return (
    <TShirtsPrintingPage
      sections={data?.settings?.sections}
      data={data?.data}
    />
  );
}
