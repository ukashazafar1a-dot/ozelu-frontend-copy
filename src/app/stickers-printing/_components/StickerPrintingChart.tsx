import SectionLoader from "@/components/Loader/SectionLoader";
import {
  FbsThick,
  FoadBoardSize,
  PageData,
  StickerMaterial,
  StickerShape,
} from "@/libs/types";
import React, { useEffect, useState } from "react";
type props = {
  data: PageData;
};
const StickerPrintingChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<StickerMaterial[] | null>(null);
  const [shapes, setShapes] = useState<StickerShape[] | null>(null);

  useEffect(() => {
    setSorted(data?.stickers_prices ? data?.stickers_prices : null);
    setShapes(data?.stickers_prices ? data?.stickers_prices[0]?.shapes : null);
    setLoading(false);
  }, [data]);
  return (
    <>
      {loading ? (
        <SectionLoader />
      ) : (
        <>
          <div className="dp-table-inside text-center mb-5">
            <table className="sizes-table table">
              <thead>
                <tr>
                  <th
                    style={{
                      background: "#6ec1cd",
                    }}
                  >
                    Price For 1 A4 Sheet
                  </th>
                  {shapes &&
                    shapes.map((shape, index: any) => {
                      return <th key={index}>{shape?.value}</th>;
                    })}
                </tr>
              </thead>
              <tbody>
                {sorted &&
                  sorted.map((material, index: number) => (
                    <tr key={index}>
                      <td>{material?.type}</td>
                      {material?.shapes &&
                        material?.shapes?.map((thick, index: any) => {
                          return <td key={index}>{thick?.price}</td>;
                        })}
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

export default StickerPrintingChart;
