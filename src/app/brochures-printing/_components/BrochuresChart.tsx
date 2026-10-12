"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import { BrochurePrice, PageData } from "@/libs/types";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

type Props = {
  data: PageData;
};

const chartSelectStyles = {
  ...selectStyles,
  menu: (styles: any) => ({
    ...styles,
    zIndex: 40,
    backgroundColor: "#ededed",
  }),
  menuPortal: (styles: any) => ({
    ...styles,
    zIndex: 9999,
  }),
};

const getQuantitiesForType = (brochureType: BrochurePrice | null): number[] => {
  if (!brochureType?.columns?.length) return [];
  const quantitySet = new Set<number>();
  brochureType.columns.forEach((column) => {
    column.quantities?.forEach((q) => {
      quantitySet.add(q.value);
    });
  });
  return Array.from(quantitySet).sort((a, b) => a - b);
};

const getCellTotal = (
  column: BrochurePrice["columns"][number],
  quantity: number,
): number | null => {
  const q = column.quantities?.find((item) => item.value === quantity);
  if (!q || typeof q.price !== "number" || q.price <= 0) return null;
  return q.price;
};

const getPerPiece = (total: number | null, quantity: number): number | null => {
  if (total == null || !quantity) return null;
  return parseFloat((total / quantity).toFixed(2));
};

const BrochuresChart = ({ data }: Props) => {
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState<BrochurePrice[]>([]);
  const [selected, setSelected] = useState<BrochurePrice | null>(null);
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setMenuPortalTarget(document.body);
  }, []);

  useEffect(() => {
    if (data?.brochure_prices && data.brochure_prices.length > 0) {
      setTypes(data.brochure_prices);
      // Same as Menu/Flyers/BC charts: first type selected so the table is visible on load.
      setSelected(data.brochure_prices[0]);
    }
    setLoading(false);
  }, [data]);

  const typeOptions = useMemo(
    () => types.map((t) => ({ value: t.value, label: t.label })),
    [types],
  );

  const quantities = useMemo(
    () => getQuantitiesForType(selected),
    [selected],
  );

  const columns = selected?.columns || [];

  if (loading) return <SectionLoader />;
  if (!types.length) {
    return null;
  }

  return (
    <>
      <div className="align-items-center d-flex justify-content-center text-center">
        <div className="formControll">
          <Select
            options={typeOptions}
            value={
              selected
                ? { value: selected.value, label: selected.label }
                : null
            }
            onChange={(e: any) => {
              const next = types.find((t) => t.value === e?.value);
              if (next) setSelected(next);
            }}
            placeholder="Choose Your Brochure Type"
            className="selectOptionsCustom-chart"
            styles={chartSelectStyles}
            menuPortalTarget={menuPortalTarget}
            menuPosition="fixed"
            isClearable={false}
          />
        </div>
      </div>
      {selected && quantities.length > 0 ? (
        <div className="service-page-chart-wrapper">
          <div className="dp-table-inside text-center mb-5 pt-3">
            <table className="sizes-table table">
              <thead>
                <tr>
                  <th className="align-middle">Quantity</th>
                  {columns.map((column) => (
                    <th className="align-middle" key={column.key}>
                      <span className="brochures-chart-th-line">
                        {column.label}
                      </span>
                      <br />
                      <span className="brochures-chart-th-line">
                        Price (AED)
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quantities.map((quantity) => (
                  <tr key={quantity}>
                    <td className="align-middle">{quantity}</td>
                    {columns.map((column) => {
                      const total = getCellTotal(column, quantity);
                      const perPiece = getPerPiece(total, quantity);
                      return (
                        <td key={column.key} className="align-middle">
                          <div className="fw-medium">{total ?? "N/A"}</div>
                          <div className="text-xs">
                            {perPiece != null ? `${perPiece} / Piece` : "N/A"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default BrochuresChart;
