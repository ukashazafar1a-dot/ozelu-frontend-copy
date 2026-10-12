"use client";
import ProductCard from "@/components/EComereceStore/ProductCard";
import React from "react";
import CollectionLoader from "./CollectionLoader";

type props = {
  products: any;
  mobilePerLine?: any;
  desktopPerLine?: any;
  tabletPerLine?: any;
  loading?: boolean;
};

const ProductsGrid = ({
  products,
  mobilePerLine,
  desktopPerLine,
  tabletPerLine,
  loading,
}: props) => {
  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <div className="row m-0 p-0 px-md-2 flex-grow-1">
      <div className="col-lg-12 col-12 p-0 px-md-3">
        <div className="shopify-section tp_se_cdt position-relative">
          <div className="on_list_view_false products nt_products_holder row fl_center row_pr_1 cdt_des_1 round_cd_false nt_cover ratio2_3 position_8 space_30 equal_nt nt_default">
            {/* Items */}
            {loading ? (
              <CollectionLoader />
            ) : hasProducts ? (
              products?.map((product: any) => {
                return (
                  <ProductCard
                    key={product?._id}
                    sizeD={desktopPerLine}
                    sizeT={tabletPerLine}
                    sizeM={mobilePerLine}
                    product={product}
                  />
                );
              })
            ) : (
              <p className="font-primary py-5">No Products Found!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsGrid;
