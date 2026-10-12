"use client";

import React, { useEffect, useState } from "react";
import Banner from "./Banner";
import "./style.css";
import "../CollectionPage/CollectionGridItems.css";
import CardSlider from "./CardSlider";
import ProductSlider from "./ProductSlider";
import SectionLoader from "@/components/Loader/SectionLoader";
import { baseURL } from "@/libs/utils";

type props = {
  data?: any;
};

const CollectionsGrid = ({ data }: props) => {
  const [collections, setCollections] = useState<any>([]);
  const [trending, setTrending] = useState<any>([]);
  const [trendingCollections, setTrendingCollections] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${baseURL}/api/assets/collections`);
      if (!res.status) {
        throw new Error("Failed to fetch data");
      }
      const result = await res.json();
      //console.log(result);
      if (result?.status) {
        const { trendingCollections, trendingProducts } = result;
        setTrending(trendingProducts);
        setTrendingCollections(trendingCollections);
      }
    } catch (error) {
      console.log("Error>>", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCollections(data?.collections);
    getData();
  }, [data]);
  // console.log("data", data, "collections", collections);
  return (
    <div className="collection_grid_template">
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <Banner />
          <CardSlider collections={trendingCollections} />
          {/* {trending && (
            <TrendingProducts products={trending} title={"Trending Now"} />
          )} */}
          {collections ? (
            collections?.map((collection: any,index:number) => {
              return (
                <ProductSlider key={index} collection={collection} />
              );
            })
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionsGrid;
