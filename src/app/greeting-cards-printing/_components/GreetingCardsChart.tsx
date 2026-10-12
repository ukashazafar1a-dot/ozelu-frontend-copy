import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import { getUniqueDiscountPercentages } from "@/libs/discounts";
import {
  GreetingCardSize,
  GreetingCardType,
  PageData,
} from "@/libs/types";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";

type props = {
  data: PageData;
};

const getPaperTypes = (sizes: GreetingCardSize[]): GreetingCardType[] => {
  const map = new Map<string, GreetingCardType>();
  sizes.forEach((size) => {
    size.types?.forEach((type) => {
      if (type?.value && !map.has(type.value)) {
        map.set(type.value, type);
      }
    });
  });
  return Array.from(map.values());
};

const formatInches = (size: GreetingCardSize) => {
  const w =
    size.width_in_inches ?? parseFloat((size.width / 2.54).toFixed(1));
  const h =
    size.height_in_inches ?? parseFloat((size.height / 2.54).toFixed(1));
  return `${w}"x${h}"`;
};

const getPriceForSize = (
  size: GreetingCardSize,
  paperType: GreetingCardType | null
) => {
  if (!paperType) return null;
  const type = size.types?.find((item) => item.value === paperType.value);
  if (!type) return null;
  return type.price ?? null;
};

const getDiscountRangeForPercentage = (
  size: GreetingCardSize,
  paperTypeValue: string,
  percentage: number
) => {
  const type = size.types?.find((item) => item.value === paperTypeValue);
  const discount = type?.discounts?.find((item) => item.percentage === percentage);
  return discount?.range ?? "";
};

const GreetingCardsChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sizes, setSizes] = useState<GreetingCardSize[]>([]);
  const [paperTypes, setPaperTypes] = useState<GreetingCardType[]>([]);
  const [selected, setSelected] = useState<GreetingCardType | null>(null);
  const selectRef = useRef<any>(null);

  const handleChange = (e: any) => {
    const next = paperTypes.find((type) => type.value === e.value);
    if (next) setSelected(next);
  };

  useEffect(() => {
    if (data?.greeting_cards_prices && data.greeting_cards_prices.length > 0) {
      const priceData = data.greeting_cards_prices;
      setSizes(priceData);
      const types = getPaperTypes(priceData);
      setPaperTypes(types);
      if (types.length > 0) setSelected(types[0]);
    }
    setLoading(false);
  }, [data]);

  const discountColumns = useMemo(() => {
    if (!selected) return [];
    return getUniqueDiscountPercentages(
      sizes.map((size) => {
        const type = size.types?.find((item) => item.value === selected.value);
        return type?.discounts;
      })
    );
  }, [sizes, selected]);

  if (loading) return <SectionLoader />;
  if (!sizes.length) return null;

  return (
    <>
      <div className="align-items-center d-flex justify-content-center text-center">
        <div className="formControll">
          <Select
            ref={selectRef}
            options={paperTypes.map((type) => ({
              value: type.value,
              label: type.value,
            }))}
            onChange={handleChange}
            value={
              selected
                ? { value: selected.value, label: selected.value }
                : null
            }
            placeholder="Please Select Paper Type"
            className="selectOptionsCustom-chart"
            styles={selectStyles}
          />
        </div>
      </div>

      <div className="photoPrintingSizesChart service-page-chart-wrapper greeting-cards-sizechart-wrapper text-center mb-5 pt-3">
        <table className="photoSize table text-center">
          <thead>
            <tr>
              <th className="gcp-chart-th-single">Sizes in cm</th>
              <th className="gcp-chart-th-single">Sizes in inches</th>
              <th className="gcp-chart-th-single">Type</th>
              <th
                className="gcp-chart-th-single"
                style={{ background: "var(--primary-color)", color: "#000" }}
              >
                Price (AED)
              </th>
              {discountColumns.map((percentage) => (
                <th key={percentage} className="gcp-chart-th-discount">
                  <span className="gcp-chart-th-discount-line">
                    {percentage}% Discount
                  </span>
                  <span className="gcp-chart-th-discount-line">For Quantities</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sizes.map((size) => (
              <tr
                key={size._id || `${size.width}-${size.height}-${size.name}`}
              >
                <td className="align-middle">
                  {size.width}x{size.height}
                </td>
                <td className="align-middle">{formatInches(size)}</td>
                <td className="align-middle">{size.name || "-"}</td>
                <td className="align-middle">
                  {getPriceForSize(size, selected) ?? "N/A"}
                </td>
                {discountColumns.map((percentage) => (
                  <td key={percentage} className="align-middle">
                    {getDiscountRangeForPercentage(
                      size,
                      selected?.value || "",
                      percentage
                    ) || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default GreetingCardsChart;
