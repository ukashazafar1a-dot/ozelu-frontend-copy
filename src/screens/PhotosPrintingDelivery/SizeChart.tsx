import { convertLength, htmlDecode } from '@/helpers/generals';
import { PhotoPrintSizeType } from '@/libs/types';
import { getUniqueDiscounts } from '@/libs/utils';
import React, { useEffect, useState } from 'react';

function SizeChart({data,section}:any) {

    const [loading, setLoading] = useState<boolean>(true);
    const [sorted, setSorted] = useState<PhotoPrintSizeType[] | null>(null);
    const [keys, setKeys] = useState<number[]>([]);
  
    useEffect(() => {
      if (data) {
        setSorted(
          data?.sizes ? data?.sizes : []
        );
        if (data?.sizes) {
          const newKeys = getUniqueDiscounts(data?.sizes);
          setKeys(newKeys);
        }
        setLoading(false);
      }
    }, [data]);

  if(!data) return '';

  return (
    <div className="container">
      {section && section?.settings?.title && (
        <h2 
          className="headingSizeChart playfair-heading-800 text-center my-3 fw-bold"
          dangerouslySetInnerHTML={{
            __html: htmlDecode(section.settings.title)
          }}/>
      )}
      {section && section?.settings?.content && (
        <div 
          className='mb-5 context text-center'
          dangerouslySetInnerHTML={{
            __html: htmlDecode(section.settings.content)
          }}
        />
      )}
      <div className="photoPrintingSizesChart">
        <table className="photoSize table text-center ">
          <thead>
            <tr>
              <th>Sizes in cm</th>
              <th>Sizes in inches</th>
              <th style={{background:'var(--primary-color)',color:'#000'}}>Price (AED)</th>
              {keys && keys?.length > 0 ? (
                keys?.map((key, index) => {
                  return (
                    <th key={index}>
                        {key}% Discount
                        <br />
                        For Quantities
                    </th>
                  );
                })
              ) : (
                <></>
              )}
            </tr>
          </thead>
          <tbody>
            {data?.sizes && data.sizes?.map((size:any,index:any)=>{
              return <tr key={index}>
                <td>{size.width}x{size.height}</td>
                <td>{size.width_in_inches}{'"'}x{size.height_in_inches}{'"'} {size.name ? ('('+size.name+')') : ''}</td>
                <td>{size.price}</td>
                {size?.discounts && size?.discounts?.length > 0 ? (
                    size?.discounts?.map((discount:any, innerIndex:any) => {
                      return <td key={innerIndex}>{discount?.range}</td>;
                    })
                  ) : (
                    <></>
                )}
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SizeChart