"use client";

import SectionLoader from "@/components/Loader/SectionLoader";
import { PageData } from "@/libs/types";
import { getUniqueRanges } from "@/libs/utils";
import React, { useEffect, useState } from "react";

type props = {
  data: PageData;
};

const MugsChart = ({ data }: props) => {
  const [loading, setLoading] = useState(true);
  const [mugs, setMugs] = useState<any[]>([]);
  const [tierKeys, setTierKeys] = useState<string[]>([]);

  useEffect(() => {
    if (data?.mugs_prices) {
      setMugs(data.mugs_prices);
      setTierKeys(getUniqueRanges(data.mugs_prices));
    }
    setLoading(false);
  }, [data]);

  if (loading) return <SectionLoader />;
  if (!mugs.length) return null;

  return (
    <div className="service-page-chart-wrapper">
      <div className="photoPrintingSizesChart dp-table-inside text-center vbps-chart dpd mb-5">
        <table className="photoSize table">
          <thead>
            <tr>
              <th>Mug Type</th>
              {tierKeys.map((key, index) => (
                <th key={index}>
                  Price (AED)
                  <br />
                  {key} Prints
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mugs.map((mug) => (
              <tr key={mug?._id || mug?.value}>
                <td>{mug?.value}</td>
                {tierKeys.map((tierKey, index) => {
                  const tier = mug?.prices?.find(
                    (p: any) => p?.range === tierKey
                  );
                  return <td key={index}>{tier?.price ?? "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MugsChart;
