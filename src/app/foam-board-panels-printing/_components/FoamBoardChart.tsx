import SectionLoader from "@/components/Loader/SectionLoader";
import { FbsThick, FoadBoardSize, PageData } from "@/libs/types";
import React, { useEffect, useState } from "react";
type props = {
  data: PageData;
};
const FoamBoardChart = ({ data }: props) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [sorted, setSorted] = useState<FoadBoardSize[] | null>(null);
  const [thickness, setThickness] = useState<FbsThick[] | null>(null);

  useEffect(() => {
    setSorted(data?.foam_board_sizes ? data?.foam_board_sizes : null);
    setThickness(
      data?.foam_board_sizes ? data?.foam_board_sizes[0]?.thicknesses : null
    );
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
                  <th style={{padding:'0.7rem'}}>Sizes in cm</th>
                  <th style={{padding:'0.7rem'}}>Sizes in inches</th>
                  {thickness &&
                    thickness.map((thick, index: any) => {
                      return (
                        <th key={index} style={{padding:'0.7rem'}}>{thick?.value}mm Foam Board (AED)</th>
                      );
                    })}
                </tr>
              </thead>
              <tbody>
                {sorted &&
                  sorted.map((size, index: number) => (
                    <tr key={index}>
                      <td style={{padding:'0.7rem'}}>
                        {size?.width}x{size?.height}
                      </td>
                      <td style={{padding:'0.7rem'}}>
                        {size?.width_in_inches}x{size?.height_in_inches}{" "}{size?.name ? ('('+size?.name+')') : ''}
                      </td>
                      {size?.thicknesses &&
                        size?.thicknesses?.map((thick, index: any) => {
                          return <td key={index} style={{padding:'0.7rem'}}>{thick?.price}</td>;
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

export default FoamBoardChart;
