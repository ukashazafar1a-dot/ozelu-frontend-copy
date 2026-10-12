"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import { PageData } from "@/libs/types";
import { getUniqueRanges } from "@/libs/utils";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

type props = { data: PageData };

function getPrintTypes(prices: any[]) {
  return Array.from(
    new Set((prices || []).map((r) => r.print_type).filter(Boolean))
  );
}

/** Display-only label for tier headers (CMS range keys stay unchanged for lookups). */
function formatTierRangeLabel(rangeKey: string) {
  if (rangeKey === ">100") return "100+";
  return rangeKey;
}

export default function TShirtsChart({ data }: props) {
  const [loading, setLoading] = useState(true);
  const [allPrices, setAllPrices] = useState<any[]>([]);
  const [printTypes, setPrintTypes] = useState<string[]>([]);
  const [selectedPrintType, setSelectedPrintType] = useState("");

  useEffect(() => {
    const rows = data?.t_shirts_prices || [];
    setAllPrices(rows);
    const types = getPrintTypes(rows);
    setPrintTypes(types);
    setSelectedPrintType(types[0] || "");
    setLoading(false);
  }, [data]);

  const filteredRows = useMemo(
    () => allPrices.filter((r) => r.print_type === selectedPrintType),
    [allPrices, selectedPrintType]
  );

  const tierKeys = useMemo(() => getUniqueRanges(filteredRows), [filteredRows]);

  if (loading) return <SectionLoader />;
  if (!filteredRows.length) return null;

  return (
    <>
      {printTypes.length > 0 && (
        <div className="align-items-center d-flex justify-content-center text-center">
          <div className="formControll">
            <Select
              options={printTypes.map((t) => ({ label: t, value: t }))}
              value={{ label: selectedPrintType, value: selectedPrintType }}
              onChange={(e: any) => setSelectedPrintType(e.value)}
              placeholder="Please Select Print Type"
              className="selectOptionsCustom-chart"
              styles={selectStyles}
            />
          </div>
        </div>
      )}
      <div className="service-page-chart-wrapper">
        <div className="photoPrintingSizesChart dp-table-inside text-center vbps-chart dpd mb-5 pt-3">
          <table className="photoSize table">
            <thead>
              <tr>
                <th>Shirt Type</th>
                {tierKeys.map((key) => (
                  <th key={key} className="align-middle">
                    <div className="fw-medium">{formatTierRangeLabel(key)} Pieces</div>
                    <div className="text-xs">(AED / Shirt)</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.print_type}-${row.value}`}>
                  <td>{row.value}</td>
                  {tierKeys.map((tierKey) => {
                    const tier = row.prices?.find((p: any) => p.range === tierKey);
                    const price = tier?.price;
                    return (
                      <td key={tierKey} className="align-middle">
                        {price != null && price !== "" ? (
                          <>
                            <div className="fw-medium">{price}</div>
                            <div className="text-xs">/ Shirt</div>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
