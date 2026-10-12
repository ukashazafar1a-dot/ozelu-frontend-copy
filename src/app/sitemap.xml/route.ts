import { Site } from "@/libs/site";


export const revalidate = 5;
export const runtime = "edge";

const staticURls = () => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
                        <loc>${Site?.url}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>1.00</priority>
<changefreq>daily</changefreq>
                    </url>
                      </urlset>
                      `;

const createSitemap = (posts: any) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
                        <loc>${Site?.url}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>1.00</priority>
<changefreq>daily</changefreq>
                    </url>
        ${posts
          .map((post: any) => {
            return `
                    <url>
                        <loc>${Site?.url +  post}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
<priority>1.00</priority>
<changefreq>daily</changefreq>
                    </url>
                `;
          })
          .join("")}
    </urlset>
    `;
export async function GET(): Promise<Response> {
  const headers = new Headers();
  headers.set("Content-Type", "application/xml");
  const EXTERNAL_DATA_URL = `${process?.env?.NEXT_PUBLIC_API_URL}/api/assets/slugs`;
  const request = await fetch(EXTERNAL_DATA_URL);
  const response = await request.json();
  //console.log(response)
  if (response) {
    const { urls } = response;
    const sitemap = createSitemap(urls);
    return new Response(sitemap, {
      headers,
    });
  } else {
    return new Response(staticURls(), {
      headers,
    });
  }
}
