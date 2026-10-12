import React from 'react'
import Index from '@/screens/Page/Index'
import { notFound } from 'next/navigation';

export const runtime = 'edge';
const parent = 'policies';


const getData = async function(slug:any){
	try {
		const data = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/assets/pages/"+slug,{ 
      next: {
        revalidate: 60
      }
     });
		const response = await data.json();
    if(response?.status){
      return response;
    }
    return notFound()
	} catch (error) {
		return null
	}
}

export async function generateMetadata({ params }:any) {
	// read route params
  const slug = params.slug;
  const result = await getData(slug);
  if(!result || !slug || !result.page){
      return {}
  }
  const {page} = result;
  // console.log('result  data', page,result);
  const title = `${page.page_title ? page.page_title : slug}`;
  const desc = `${page.meta_description ? page.meta_description : ''}`;
  const URL = `/${parent}/${slug}`;
  return {
      title: title,
      description: desc,
      alternates: {
        canonical: URL,
      },
      openGraph: {
        title,
        description: desc,
        url:URL
      },
    }
}

async function page({params}:any) {
  const {page} = await getData(params?.slug);
  //console.log(page)
  return (
    <Index content={page}/>
  )
}

export default page