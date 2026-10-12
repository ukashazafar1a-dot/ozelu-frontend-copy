"use client"
import ProductCard from "@/components/EComereceStore/ProductCard";
import React, { useState } from "react";

const ProductFlex = ({ products }: any) => {
  const [productsPerLineD, setProductsPerLineD] = useState(4);
  const [productsPerLineT, setProductsPerLineT] = useState(3);
  const [productsPerLineM, setProductsPerLineM] = useState(2);
  return (
    <div className="row">
      <div className="col-lg-12 col-12">
        <div className="shopify-section">
          <div className="on_list_view_false products nt_products_holder row  row_pr_1 cdt_des_1 round_cd_false nt_cover ratio2_3 position_8 space_30 equal_nt nt_default">
            {products &&
              products.map((product: any) => {
                return (
                  <ProductCard
                    key={product?._id}
                    sizeD={productsPerLineD}
                    sizeT={productsPerLineT}
                    sizeM={productsPerLineM}
                    product={product}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFlex;
