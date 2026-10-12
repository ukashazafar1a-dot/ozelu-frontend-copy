import SectionLoader from "@/components/Loader/SectionLoader";
import { selectStyles } from "@/components/SearchableSelect";
import {
  BusinessCardSize,
  BusinessCardType,
  PageData,
} from "@/libs/types";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
type props = {
  data: PageData;
};

/**
 * Business Cards chart dropdown — match Menu Printing layout:
 * centered control, sensible width, labels on one line, open list = control width.
 */
const chartSelectStyles = {
  ...selectStyles,
  container: (styles: any) => ({
    ...styles,
    width: "100%",
  }),
  control: (styles: any) => ({
    ...selectStyles.control(styles),
    width: "100%",
  }),
  singleValue: (styles: any) => ({
    ...styles,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
  }),
  menu: (styles: any) => ({
    ...styles,
    zIndex: 40,
    backgroundColor: "#ededed",
  }),
  menuPortal: (styles: any) => ({
    ...styles,
    zIndex: 9999,
  }),
  option: (styles: any, state: any) => ({
    ...selectStyles.option(styles, state),
    whiteSpace: "nowrap",
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
  }),
};

// Utility function to get all unique quantities
const getAllQuantities = (data: BusinessCardSize[]): number[] => {
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

// Utility function to calculate total price for a given quantity
const calculateTotalPrice = (
  types: BusinessCardType[],
  selectedType: BusinessCardType | null,
  quantity: number
): number | null => {
  const type = types.find((item)=>item.value === selectedType?.value);
  if(!type) return null;
  const newQuantity = type.quantities.find((item)=>item.value === quantity);
  if(!newQuantity) return null;
  return newQuantity.price;
};
// Calculate price per card for a given quantity
const calculateCardPricesPerType = (
  types: BusinessCardType[],
  selectedType: BusinessCardType | null,
  quantity: number
): number | null => {
  const totalPrice = calculateTotalPrice(types,selectedType, quantity);
  if(totalPrice) return parseFloat((totalPrice / quantity).toFixed(2));
  return null;
};

const BcardsChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<BusinessCardSize[] | null>(null);
  const [types,setTypes] = useState<BusinessCardType[] | null>(null);
  const [selected, setSelected] = useState<BusinessCardType | null>(null);
  const [quantities, setQuantities] = useState<number[]>([]);
  const selectRef = useRef<any>(null);
  const [menuPortalTarget, setMenuPortalTarget] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    setMenuPortalTarget(document.body);
  }, []);

  const handleChange = function(e:any){
    const {value} = e;
    const newSelectedType = types?.find((type)=>type.value===value);
    if(newSelectedType) setSelected(newSelectedType)
  }

  useEffect(() => {
    if (data?.business_cards_prices) {
      setSorted(data?.business_cards_prices);
      setQuantities(getAllQuantities(data?.business_cards_prices));
    }
    if(data?.business_cards_prices && data.business_cards_prices.length > 0 && data.business_cards_prices[0]?.types && data.business_cards_prices[0].types.length > 0){
      setSelected(data.business_cards_prices[0].types[0])
      setTypes(data.business_cards_prices[0].types);
    }
    setLoading(false);
  }, [data]);

  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          {/*
            Match Menu Printing chart dropdown: centered, ~menu-like width,
            one-line labels. Scoped to this chart only.
          */}
          <style>{`
            .bcards-chart-filters {
              width: 100%;
            }
            .bcards-chart-filters .bcards-chart-type-select {
              /* Match Menu Printing type-select scale (slightly under previous 30rem) */
              width: min(100%, 26rem);
              max-width: 100%;
              margin-left: auto;
              margin-right: auto;
            }
            .bcards-chart-filters .bcards-chart-type-select.selectOptionsCustom-chart,
            .bcards-chart-filters .bcards-chart-type-select .selectOptionsCustom-chart {
              width: 100% !important;
              max-width: none !important;
              min-width: 250px !important;
              margin-left: auto;
              margin-right: auto;
              display: block;
            }
          `}</style>
          <div className="align-items-center d-flex justify-content-center text-center flex-wrap bcards-chart-filters">
            <div className="formControll bcards-chart-type-select">
              <Select
                ref={selectRef}
                options={types?.map((type) => ({
                  value: type.value,
                  label: type.value,
                }))}
                value={
                  selected
                    ? { value: selected.value, label: selected.value }
                    : null
                }
                onChange={handleChange}
                placeholder="Please Select Type"
                className="selectOptionsCustom-chart"
                styles={chartSelectStyles}
                menuPortalTarget={menuPortalTarget}
                menuPosition="fixed"
                isClearable={false}
              />
            </div>
          </div>
          <div className="dp-table-inside text-center mb-5 pt-3">
            <table className="sizes-table table">
              <thead>
                <tr>
                  <th className="align-middle">Quantity</th>
                  {sorted &&
                    sorted.map((standard) => (
                      <th className="align-middle" key={standard._id}>
                        {standard?.name}
                        <br />({standard?.width}x{standard?.height}mm)
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {quantities &&
                  quantities?.map((quantity) => (
                    <tr key={quantity}>
                      <td className="align-middle">{quantity}</td>
                      {sorted &&
                        sorted.map((size) => (
                          <td key={size._id} className="align-middle">
                            <div className="fw-medium">
                              {calculateTotalPrice(size?.types,selected, quantity) ||
                                "N/A"}
                            </div>
                            <div className="text-xs">
                              {(() => {
                                const perCard = calculateCardPricesPerType(
                                  size?.types,
                                  selected,
                                  quantity
                                );
                                return perCard != null
                                  ? `${perCard} / Card`
                                  : "N/A";
                              })()}
                            </div>
                          </td>
                        ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default BcardsChart;
