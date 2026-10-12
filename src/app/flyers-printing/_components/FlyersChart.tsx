"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import { FlyerSize, FlyerType, PageData } from "@/libs/types";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

type Props = {
  data: PageData;
};

/**
 * Print-type rows in the price chart. `value` is the canonical key matched
 * against the price record (`single_side_price` vs `double_side_price`) and
 * MUST stay in sync with `FlyersOrderForm.tsx`'s `PRINT_TYPE_OPTIONS`.
 * `label` is what's actually shown in the chart cell.
 */
const PRINT_TYPES: { value: "Single Side" | "Double Side"; label: string }[] = [
  { value: "Single Side", label: "Single Sided Printing" },
  { value: "Double Side", label: "Double Sided Printing" },
];
type PrintType = (typeof PRINT_TYPES)[number];

/** Price chart, small screens only: two lines so “Double Sided” does not split into three. */
const chartPrintSidesLabelMobile = (label: string) => {
  const m = label.match(/^(.+?)\s+Printing$/);
  if (!m) return label;
  return (
    <>
      <span className="flyers-chart-print-line1">{m[1]}</span>
      <br />
      Printing
    </>
  );
};

const getAllQuantities = (data: FlyerSize[]): number[] => {
  const quantitySet = new Set<number>();
  data.forEach((size) => {
    size.types.forEach((type) => {
      type.quantities.forEach((quantity) => {
        quantitySet.add(quantity.value);
      });
    });
  });
  return Array.from(quantitySet).sort((a, b) => a - b);
};

const getCellPrice = (
  size: FlyerSize,
  selectedType: FlyerType | null,
  quantity: number,
  printType: PrintType,
): number | null => {
  const type = size.types.find((item) => item.value === selectedType?.value);
  if (!type) return null;
  const q = type.quantities.find((item) => item.value === quantity);
  if (!q) return null;
  const price =
    printType.value === "Single Side" ? q.single_side_price : q.double_side_price;
  return typeof price === "number" ? price : null;
};

const FlyersChart = ({ data }: Props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<FlyerSize[] | null>(null);
  const [types, setTypes] = useState<FlyerType[] | null>(null);
  const [selected, setSelected] = useState<FlyerType | null>(null);
  const [quantities, setQuantities] = useState<number[]>([]);
  const selectRef = useRef<any>(null);

  const handleTypeChange = function (e: any) {
    const { value } = e;
    const newSelectedType = types?.find((type) => type.value === value);
    if (newSelectedType) setSelected(newSelectedType);
  };

  useEffect(() => {
    if (data?.flyers_prices) {
      setSorted(data.flyers_prices);
      setQuantities(getAllQuantities(data.flyers_prices));
    }
    if (
      data?.flyers_prices &&
      data.flyers_prices.length > 0 &&
      data.flyers_prices[0]?.types &&
      data.flyers_prices[0].types.length > 0
    ) {
      setSelected(data.flyers_prices[0].types[0]);
      setTypes(data.flyers_prices[0].types);
    }
    setLoading(false);
  }, [data]);

  if (loading) return <SectionLoader />;

  if (!sorted || sorted.length === 0 || quantities.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className="align-items-center d-flex justify-content-center text-center flex-wrap"
        style={{ gap: "12px" }}
      >
        <div className="formControll">
          <Select
            ref={selectRef}
            options={types?.map((type) => ({
              value: type.value,
              label: type.value,
            }))}
            onChange={handleTypeChange}
            defaultValue={{
              value: selected?.value,
              label: selected?.value,
            }}
            placeholder="Please Select Flyer Type"
            className="selectOptionsCustom-chart"
            styles={selectStyles}
          />
        </div>
      </div>
      {/*
        Scoped table styling for the Flyers price chart only (`.flyers-sizechart-wrapper`).

        - Bootstrap `.table` sets `vertical-align: top` on cells; we force
          `middle` + `text-align: center` on header cells.
        - Size headers: line 1 = dimensions + size name, line 2 = Price (AED).
          `.flyers-chart-th-size-line` uses nowrap so narrow widths do not
          split line 1 into extra wraps (matches desktop two-line layout).
        - Printing Sides body: below `md`, two-line label + nowrap on line 1; `md+` plain text (desktop).
        - Price body cells: normal font weight (not fw-medium / semi-bold).
      */}
      <style>{`
        .flyers-sizechart-wrapper .sizes-table thead th {
          vertical-align: middle !important;
          text-align: center !important;
        }
        .flyers-sizechart-wrapper .sizes-table thead th .flyers-chart-th-size-line {
          white-space: nowrap;
        }
        .flyers-sizechart-wrapper .sizes-table tbody td.flyers-chart-print-sides .flyers-chart-print-line1 {
          white-space: nowrap;
        }
        .flyers-sizechart-wrapper .sizes-table tbody .flyers-chart-price {
          font-weight: 400;
        }
      `}</style>
      <div className="dp-table-inside text-center mb-5 pt-3 flyers-sizechart-wrapper">
        <table className="sizes-table table">
          <thead>
            <tr>
              <th>Quantity</th>
              <th>Printing Sides</th>
              {sorted.map((size) => (
                <th key={size._id}>
                  <span className="flyers-chart-th-size-line">
                    {size?.width}x{size?.height}cm - {size?.name}
                  </span>
                  <br />
                  Price (AED)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {quantities.map((quantity) =>
              PRINT_TYPES.map((printType, idx) => (
                <tr key={`${quantity}-${printType.value}`}>
                  {idx === 0 && (
                    <td className="align-middle" rowSpan={PRINT_TYPES.length}>
                      {quantity}
                    </td>
                  )}
                  <td className="align-middle flyers-chart-print-sides">
                    <span className="d-block d-md-none">
                      {chartPrintSidesLabelMobile(printType.label)}
                    </span>
                    <span className="d-none d-md-block">{printType.label}</span>
                  </td>
                  {sorted.map((size) => (
                    <td key={size._id} className="align-middle">
                      <div className="flyers-chart-price">
                        {getCellPrice(size, selected, quantity, printType) ??
                          "N/A"}
                      </div>
                    </td>
                  ))}
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default FlyersChart;
