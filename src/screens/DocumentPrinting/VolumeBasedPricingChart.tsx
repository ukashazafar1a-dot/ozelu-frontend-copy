"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { PageData, VolumePriceType } from "@/libs/types";
import { getUniqueRanges } from "@/libs/utils";
import React, { useEffect, useState } from "react";
type props = {
  data: PageData;
};
const VolumeBasedPricingChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<VolumePriceType[] | null>(null);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      setSorted(
        data?.document_volume_prices ? data?.document_volume_prices : []
      );
      if (data?.document_volume_prices) {
        const newKeys = getUniqueRanges(data?.document_volume_prices);
        setKeys(newKeys);
      }
      setLoading(false);
    }
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
        <div className="photoPrintingSizesChart dp-table-inside text-center vbps-chart dpd">
          <table className="photoSize table">
            <thead>
              <tr>
                <th>Type of Print</th>
                <th>Size</th>
                {keys && keys?.length > 0 ? (
                  keys?.map((key, index) => {
                    return (
                      <th key={index}>
                        Price (AED)
                        <br />
                        {key} Pages
                      </th>
                    );
                  })
                ) : (
                  <></>
                )}
              </tr>
            </thead>
            <tbody>
              {sorted &&
                sorted.map((print) => (
                  <tr key={print?._id}>
                    <td>{print?.type}</td>
                    <td>{print?.size}</td>
                    {print?.prices && print?.prices?.length > 0 ? (
                      print?.prices?.map((price, index) => {
                        return <td key={index}>{price?.price}</td>;
                      })
                    ) : (
                      <></>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolumeBasedPricingChart;
