import { redirect } from "next/navigation";
export const runtime = "edge";
// /api/assets/blog/handle
// /api/assets/blogs
// /api/assets/blogs/categories
// <SingleCategoryPage articles={result} content={data} />
const page = async ({ params }: any) => {
  redirect("/blog");
};

export default page;
