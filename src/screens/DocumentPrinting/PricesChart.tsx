"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import React, { useEffect, useState } from "react";

function PricesChart({ data }: any) {
  const [loading, setLoading] = useState<any>(true);
  const [sorted, setSorted] = useState<any>(null);

  // Custom sorting function
  const customSort = (a: any, b: any) => {
    if (a.size === "A4" && b.size !== "A4") {
      return -1;
    }
    if (a.size !== "A4" && b.size === "A4") {
      return 1;
    }
    return 0;
  };

  useEffect(() => {
    const sortedData = data?.options?.sort(customSort);
    setSorted(sortedData);
    setLoading(false);
  }, [data]);
  //console.log(options, sorted);
  return (
    <div className="margin-bottom container">
      <div className="formControll">
        <h2 className="headingSizeChart heading-h2 text-center mt-5 mb-3 fw-bold">
          Documents Printing Sizes & Prices
        </h2>
        <p className="text-center mb-5">
          Take advantage of our volume/bulk based pricing and get the best price
          with optimal quality for your documents printing needs
        </p>
      </div>
      {loading ? (
        <SectionLoader />
      ) : (
        <div className="photoPrintingSizesChart dp-table-inside text-center">
          <table className="photoSize table">
            <thead>
              <tr>
                <th>Type of Print</th>
                <th>Size</th>
                <th>Price (AED)</th>
              </tr>
            </thead>
            <tbody>
              {sorted &&
                sorted.map((print: any) => (
                  <tr key={print?._id}>
                    <td>{print?.type}</td>
                    <td>{print?.size}</td>
                    <td>{print?.price}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PricesChart;
