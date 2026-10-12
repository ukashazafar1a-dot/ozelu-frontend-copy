import { notFound } from "next/navigation";
export const getData = async (slug) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/assets/page/settings/${slug}`,
      { cache: "no-store" }
    );
    const result = await res.json();
    if (!result?.status) {
      console.log(result);
      return notFound();
    }
    return result;
  } catch (error) {
    console.log(error);
    return notFound();
  }
};
