import { htmlDecode, sanitizeDescription } from "@/helpers/generals";

type props = {
  product: {
    _id?: string;
    isActive?: boolean;
    title?: string;
    description?: string;
    sku?: string;
    quantity?: number;
    taxable?: boolean;
    type?: string;
    url?: string;
    vendor?: string;
    price?: number;
    compare_at_price?: number;
    tags?: string[];
    sales?: number;
    images?: {
      _id: string;
      alt: string;
      src: string;
      media_type: string;
      public_id: string;
      height: number;
      width: number;
      aspect_ratio: number;
      position: number;
      __v: number;
    }[];
    page_title?: string;
    meta_description?: string;
    slug?: string;
    options?: {
      name: string;
      values: string[];
      _id: string;
    }[];
    variants?: {
      title: string;
      sku: string;
      price: number;
      compare_at_price: number;
      featured_image: null;
      options: string[];
      option1: string;
      option2: string | null;
      option3: string | null;
      quantity: number;
      _id: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
    featured_image?: string;
    size_chart?: string;
    template?: string;
    collection?: string;
    review?: any;
    weight?: any;
    currency?: string;
  };
};

// product should be the product object passed as a prop
const ProductJsonLd = ({ product }: props) => {
  if (!product) {
    return <></>;
  }

  const {
    title,
    description,
    price,
    currency = "USD", // Default currency is USD, change as needed
    images,
    url,
    slug,
    sku,
    weight,
    taxable,
    review,
  } = product;

  let srcs: string[] = [];
  if (images && images.length > 0) {
    images?.forEach((image) => {
      srcs.push(image?.src);
    });
  }
  // Extract plain text from the description
   // Extract plain text and limit it to the first 1000 characters
   // Sanitize and truncate description
  const plainTextDescription = description ? sanitizeDescription(description) : "";
  //console.log(plainTextDescription);
  return (
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Product",
        name: title,
        description: plainTextDescription,
        sku: sku,
        url: slug,
        image: srcs,
        offers: {
          "@type": "Offer",
          price: price,
          priceCurrency: currency,
          availability: "http://schema.org/InStock",
          url: slug,
        },
        brand: {
          "@type": "Brand",
          name: "Demo Print Shop",
        },
        weight: {
          "@type": "QuantitativeValue",
          value: weight ? weight.value : "",
          unitCode: weight ? weight.unitCode : "KG",
        },
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Taxable",
            value: taxable ? "true" : "false",
          },
        ],
        review: review
          ? [
              {
                "@type": "Review",
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: review.ratingValue,
                  bestRating: "5",
                },
                author: {
                  "@type": "Person",
                  name: review.authorName,
                },
                datePublished: review.datePublished,
                reviewBody: review.reviewBody,
              },
            ]
          : undefined,
      })}
    </script>
  );
};

export default ProductJsonLd;
