import { htmlDecode } from "@/helpers/generals";

const ArticleSchema = ({ article }: any) => {
  //console.log(article)
  if(article){
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    articleBody: htmlDecode(article?.body_html),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": "https://example.com",
    },
    headline: article?.title,
    description: htmlDecode(article?.excerpt),
    image: [article?.featured_image?.src],
    datePublished: article?.posted_at,
    dateCreated: article?.posted_at,
    author: {
      "@type": "Person",
      name: article?.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Demo Print Shop",
    },
  };
  return (
    <>
      {/* Add JSON-LD to your page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ... */}
    </>
  );
  }else{
    return(<></>)
  }
};
export default ArticleSchema;
