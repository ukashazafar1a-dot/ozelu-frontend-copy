import { selectStyles } from "@/components/SearchableSelect";
import SectionLoader from "@/components/Loader/SectionLoader";
import { CertificatePrintSize, CertificatePrintType, FbsThick, FoadBoardSize, PageData } from "@/libs/types";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
type props = {
  data: PageData;
};
const CertificatePrintChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<CertificatePrintSize[] | null>(null);
  const [types, setTypes] = useState<CertificatePrintType[] | null>(null)
  const [selected, setSelected] = useState<CertificatePrintType | null>(null);
  const selectRef = useRef<any>(null);


  const handleChange = function(e:any){
    const {value} = e;
    const newSelectedType = types?.find((type)=>type.value===value);
    if(newSelectedType) setSelected(newSelectedType)
  }

  const renderSelectedType = function(size:any){
    if(!selected) return '';
    if(size?.types && size.types.length > 0){
      return size.types.map((type:CertificatePrintType,index:any)=>{
        if(type.value != selected?.value) return '';
        return type.discounts.map((discount:any,innerDiscount:any)=>{
          return <td key={innerDiscount}>{discount.price}</td>
        })
      })
    }
    return '';
  }


  useEffect(() => {
    setSorted(data?.certificates_prices ? data?.certificates_prices : null);
    if(data?.certificates_prices && data?.certificates_prices.length > 0 && data.certificates_prices[0].types && data.certificates_prices[0].types.length > 0){
      setTypes(data.certificates_prices[0].types)
      setSelected(data.certificates_prices[0].types[0]);
    }
    setLoading(false);
  }, [data]);
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
        <div className="align-items-center d-flex justify-content-center text-center">
          <div className="formControll">
            <Select
              ref={selectRef}
              options={types?.map((type)=>({value:type.value,label:type.value}))}
              defaultValue={{label: selected?.value,value: selected?.value}}
              onChange={handleChange}
              placeholder="Please Select Type"
              className="selectOptionsCustom-chart"
              styles={selectStyles}
            />
          </div>
          </div>
          <div className="dp-table-inside text-center mb-5 pt-3">
            <table className="sizes-table table">
              <thead>
                <tr>
                  <th className="align-middle">Sizes</th>
                  {types && types.length > 0 && types[0].discounts.map((discount,index:any)=>{
                    return <th key={index}>Price (AED)<br/>{discount.range} Prints</th>
                  })}
                </tr>
              </thead>
              <tbody>
                {sorted &&
                  sorted.map((size, index: number) => (
                    <tr key={index}>
                      <td>
                        {size?.width}x{size?.height}cm ({size?.name}) 
                      </td>
                      {renderSelectedType(size)}
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

export default CertificatePrintChart;
