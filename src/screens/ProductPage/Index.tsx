"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageLoader from "../../components/Loader/PageLoader";
import ProductDescription from "./ProductDescription";
import ProductInfo from "./ProductInfo";
import RecommendedProducts from "./RecommendedProducts";
import "./styleEcomerecServices.css";
import "./productpage.css";
import ProductJsonLd from "./components/ProductJsonLD";
import ErrorBoundary from "@/components/ErrorBoundary";

const ProductPage = ({ product: productFromServer }: any) => {
  const params = useParams();
  const slug = params?.slug;
  const [product, setProduct] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const getProduct = async () => {
    const { data } = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/assets/products/" + slug
    );
    const { product } = data;
    setProduct(product);
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    if (productFromServer) {
      setProduct(productFromServer);
      setIsLoading(false);
    } else {
      getProduct();
    }
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
  }, [slug]);
  console.log("product", product);
  return (
    <div>
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {product && (
            <>
              <ProductDescription product={product} />
              <ProductInfo product={product} />
            </>
          )}
        </>
      )}
      <ErrorBoundary fallback={<></>}>
        {product && <ProductJsonLd product={product} />}
      </ErrorBoundary>
      <RecommendedProducts />
    </div>
  );
};

export default ProductPage;
