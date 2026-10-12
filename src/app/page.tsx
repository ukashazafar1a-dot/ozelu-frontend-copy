import { getData } from '@/helpers/generals';
import Index from '@/screens/Home/Index';
import { Site } from '@/libs/site';
export const runtime = 'edge';

const slug = 'homepage';

const fallbackTitle = Site?.seo?.title || 'Demo';
const fallbackDescription = Site?.seo?.description || '';

function usableText(value: any) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'undefined' || trimmed.toLowerCase() === 'null') {
    return '';
  }
  return trimmed;
}

function homepageMetadata(page: any) {
  const title = usableText(page?.page_title) || fallbackTitle;
  const description = usableText(page?.meta_description) || fallbackDescription;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

async function loadHomepage() {
  try {
    return await getData(slug);
  } catch (error: any) {
    // getData() calls notFound() on API failure. Do not 404 the homepage
    // or let Google index the error screen as example.com.
    console.log('Failed to fetch data', error);
    return null;
  }
}

export async function generateMetadata({ params }: any) {
  const result = await loadHomepage();
  return homepageMetadata(result?.data);
}

export default async function page() {
  const data = await loadHomepage();
  return <Index content={data?.settings?.sections} />;
}
