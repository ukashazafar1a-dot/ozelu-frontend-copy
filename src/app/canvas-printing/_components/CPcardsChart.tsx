import SectionLoader from "@/components/Loader/SectionLoader";
import { convertLength } from "@/helpers/generals";
import {
  PageData
} from "@/libs/types";
import React, { useEffect, useState } from "react";
type props = {
  data: PageData;
};

const CPcardsChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [prices,setPrices] = useState<any[] | null>(null);
  const [sizes,setSizes] = useState<any[] | null>(null)
  const [selectedTypes,setSelectedTypes] = useState<any[]>([]);

  const getUniqueTypes = function(prices:any){
    let types = [];
    const simpleType = prices.find((p:any)=>{
        if(p?.type && !p.type?.hasFrame && !p.type?.hasThickness){return true}
        return false;
    });
    if(simpleType) types.push({name:simpleType.type.name,hasThickness:false,thickness:null})

    const ThicknessType = prices.find((p:any)=>{
        if(p?.type)
            return !p.type?.hasFrame && p.type?.hasThickness
        return false;
    });
    const thicknesses = Array.from(new Set(
          prices.filter((p:any) => p.thickness).map((p:any) => p.thickness.value)
    )).sort((a:any, b:any) => a - b);
    if(ThicknessType){
        const values = thicknesses.map((t:any)=>({name:ThicknessType.type.name,thickness:t,hasThickness:true}))
        types = [...types,...values]
    }
    return types;
  }

  const getPrice = function(size:any,type:any){
    if(!size || !type) return 0;
    const price = prices?.find((p:any)=>{
        return p?.size?._id == size && p.type?.name == type?.name && p.type?.hasThickness == type?.hasThickness && p?.thickness?.value == type?.thickness;
    })
    if(!price) return 0;
    return price.price;
  }

  const renderTypesHeaders = function(prices:any){
    const types = getUniqueTypes(prices)
    
    return types.map((t:any,index:any)=>(
        <th className="align-middle" key={index}>
            {t.name}{" "}{t.hasThickness ? t.thickness+"cm Thick" : ""}
        </th>
    ))
  }


  useEffect(() => {
    if (data?.prices) {
      setPrices(data.prices)
      setSelectedTypes(getUniqueTypes(data.prices))
    }
    if(data?.sizes) setSizes(data.sizes)
    setLoading(false);
  }, [data]);

  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <div className="dp-table-inside text-center mb-5 pt-3 cp-sizechart">
            <table className="sizes-table table">
              <thead>
                <tr>
                  <th className="align-middle">Sizes in cm</th>
                  <th className="align-middle sec-col">Sizes in inches</th>
                  {prices && renderTypesHeaders(prices)}
                </tr>
              </thead>
              <tbody>
                {sizes &&
                  sizes?.map((size:any) => (
                    <tr key={size._id}>
                      <td>{size.width}x{size.height}</td>
                      <td className="align-middle sec-col">{convertLength(size.width,'cm')}{'"'}x{convertLength(size.height,'cm')}{'"'} {size.name ? ('('+size.name+')') : ''}</td>
                      {selectedTypes && selectedTypes.map((type:any,index:any)=>(
                        <td key={index} className="align-middle">
                            {getPrice(size._id,type)}
                        </td>
                      ))}
                      {/* {sorted &&
                        sorted.map((size) => (
                          <td key={size._id} className="align-middle">
                            <div>
                              {calculateTotalPrice(size?.types,selected, quantity) ||
                                "N/A"}
                            </div>
                            <div>
                              {calculateCardPricesPerType(
                                size?.types,
                                selected,
                                quantity
                              ) || "N/A"}
                              /Card
                            </div>
                          </td>
                        ))} */}
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

export default CPcardsChart;
