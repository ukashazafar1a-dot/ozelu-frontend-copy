"use client";
import SectionLoader from "@/components/Loader/SectionLoader";
import { extractCountriesFromPages, htmlDecode } from "@/helpers/generals";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { selectStyles } from "@/components/SearchableSelect";
import axios from "axios";
import { PhotoRequirements } from "@/libs/types";
import { getRequirementValue } from "@/libs/utils";

const ReqTable = ({ content }: any) => {
  const [pages, setPages] = useState<PhotoRequirements[] | null>(null);
  const [selectedPages, setSelectedPages] = useState<
    PhotoRequirements[] | null
  >(null);
  const [passportSizeCountries, setPassportSizeCountries] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const selectRef = useRef<any>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const handleChange = async (selectedOption: any) => {
    const selectedValue = selectedOption?.value;
    //console.log(selectedValue);
    if (!selectedValue) return;
    setLoading(true);
    setTimeout(async () => {
      const selectedPages = await pages?.filter(
        (page: any) => page?.country === selectedValue
      );
      if (selectedPages) {
        setSelectedPages(selectedPages);
      }
      //console.log("selected objects ", selectedObjects);
      setSelectedValue(selectedValue);
      setLoading(false);
    }, 1000);
  };
  const resetSelectField = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset the select field to default state
    if (selectRef?.current) {
      await selectRef?.current?.clearValue();
    }
    setSelectedPages(pages);
    setLoading(false);
    setSelectedValue(null);
  };
  //console.log(section);

  useEffect(() => {
    const getPages = async () => {
      const { data } = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/assets/photo-requirements-pages"
      );
      const { pages } = data;
      if (pages) {
        const sortedArray = pages?.sort((a: any, b: any) => {
          if (a?.country < b?.country) {
            return -1;
          }
          if (a?.country > b?.country) {
            return 1;
          }
          return 0;
        });

        const countries = extractCountriesFromPages(pages);
        setPassportSizeCountries(countries);
        setPages(sortedArray);
        setSelectedPages(sortedArray);
        setLoading(false);
      }
    };
    getPages();
  }, []);
  console.log(pages);
  return (
    <div className="single-page-table mb-5">
      <div className="">
        <div className="sizechart-filed-wrapper d-flex justify-content-center align-items-center text-center">
          <div className="formControll">
            <Select
              ref={selectRef}
              options={passportSizeCountries}
              onChange={handleChange}
              placeholder="Please Select Your Country"
              className="selectOptionsCustom-chart"
              styles={selectStyles}
            />
            {selectedValue && (
              <button
                type="button"
                className="clear-action"
                onClick={(e) => resetSelectField(e)}
              >
                Clear Selection
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <SectionLoader />
        ) : (
          <div className="my-3 photo-requirements-table">
            {selectedPages && selectedPages?.length > 0 ? (
              <table className="photoSize single-page-table table text-left font-simple">
                <thead>
                  <tr>
                    <th scope="col" className="small-column">
                      Country
                    </th>
                    <th scope="col" className="large-column">
                      Document Type
                    </th>
                    <th scope="col" className="medium-column">
                      Type
                    </th>
                    <th scope="col" className="small-column extra-width">
                      Picture Size
                    </th>
                    <th scope="col" className="medium-column">
                      Background Color
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPages?.map((page) => {
                    return (
                      <tr key={page?._id}>
                        <td className="small-column">{page?.country}</td>
                        <td className="large-column">
                          <Link
                            href={"/passport-photo-requirements/" + page?.slug}
                            className="link color-link"
                          >
                            <span>{page?.title}</span>
                          </Link>
                        </td>
                        <td className="medium-column">
                          {getRequirementValue("Type", page?.requirements)}
                        </td>
                        <td className="small-column extra-width">
                          <div
                            className="rte"
                            dangerouslySetInnerHTML={{
                              __html: htmlDecode(
                                getRequirementValue(
                                  "Passport Picture Size",
                                  page?.requirements
                                )
                              ),
                            }}
                          />
                        </td>
                        <td className="medium-column">
                          <div className="d-flex align-items-center justify-content-start gap-2 flex-wrap">
                            <span
                              className="color-swatch-for-table"
                              style={{
                                background:
                                  getRequirementValue(
                                    "Background Color",
                                    page?.requirements
                                  ) || "white",
                              }}
                            ></span>
                            <span>
                              {getRequirementValue(
                                "Background Color",
                                page?.requirements
                              )}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <>
                <p>Noting Found!</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReqTable;

// "use client";
// import SectionLoader from "@/components/Loader/SectionLoader";
// import { getData } from "@/helpers/generals";
// import Link from "next/link";
// import React, { useEffect, useRef, useState } from "react";
// import Select from "react-select";
// import slugify from "slugify";
// import { selectStyles } from "@/components/SearchableSelect";
// import { passportSizeCountries } from "@/utils";

// const ReqTable = ({ content }: any) => {
//   const [section, setSection] = useState<any>(null);
//   const [blocks, setBlocks] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedObject, setSelectedObject] = useState<any>(null);
//   const selectRef = useRef<any>(null);
//   const [selectedValue, setSelectedValue] = useState<string | null>(null);

//   const returnSlug = (str: any) => {
//     if (str) {
//       const slug = slugify(str, {
//         replacement: "-",
//         lower: true,
//       });
//       return slug;
//     } else {
//       return "";
//     }
//   };

//   const resetSelectField = async (e: any) => {
//     e.preventDefault();
//     e.stopPropagation();
//     // Reset the select field to default state
//     if (selectRef?.current) {
//       await selectRef?.current?.clearValue();
//     }
//     setSelectedObject(section?.blocks);
//     setLoading(false);
//     setSelectedValue(null);
//   };

//   const handleChange = async (selectedOption: any) => {
//     const selectedValue = selectedOption?.value;
//     //console.log(selectedValue);
//     if(!selectedValue) return
//     setLoading(true);
//     setTimeout(async () => {
//       const selectedObjects = await blocks?.filter(
//         (block: any) => block?.settings?.country === selectedValue
//       );
//       //console.log(selectedObjects);
//       setSelectedObject(selectedObjects);
//       setSelectedValue(selectedValue);
//       setLoading(false);
//     }, 1000);
//   };

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const result = await getData("passport-size-photos");
//         //console.log(result);
//         const sections = result?.settings?.sections;
//         if (sections && sections?.passportSize) {
//           const sortedBlocks = sections?.passportSize?.blocks?.sort(
//             (a: any, b: any) =>
//               a?.settings?.country.localeCompare(b?.settings?.country)
//           );
//           setSection(sections?.passportSize);
//           setBlocks(sortedBlocks);
//           setSelectedObject(sortedBlocks);
//           setLoading(false);
//         } else {
//           return null;
//         }
//       } catch (error) {
//         console.log(error);
//         setLoading(false);
//       }
//     }
//     fetchData();
//   }, [content]);
//   //console.log("section", section, "blocks", blocks);
//   return (
//     <div className="single-page-table mb-5">
//       <div className="">
//         <div className="sizechart-filed-wrapper d-flex justify-content-center align-items-center text-center">
//           <div className="formControll">
//             <Select
//               ref={selectRef}
//               options={passportSizeCountries}
//               onChange={handleChange}
//               placeholder="Please Select Your Country"
//               className="selectOptionsCustom-chart"
//               styles={selectStyles}
//             />
//             {selectedValue && (
//           <button
//             type="button"
//             className="clear-action"
//             onClick={(e) => resetSelectField(e)}
//           >
//             Clear Selection
//           </button>
//         )}
//           </div>
//         </div>
//         {loading ? (
//           <SectionLoader />
//         ) : (
//           <div className="my-3">
//             {selectedObject && selectedObject?.length > 0 ? (
//               <table className="photoSize single-page-table table text-left font-simple">
//                 <thead>
//                   <tr>
//                     <th scope="col" className="small-column">
//                       Country
//                     </th>
//                     <th scope="col" className="large-column">
//                       Document Type
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {selectedObject?.map((block: any) => {
//                     return (
//                       <tr key={block?._id}>
//                         <td className="small-column">
//                           {block?.settings?.country}
//                         </td>
//                         <td className="large-column">
//                           <Link
//                             href={
//                               "/passport-photo-requirements/" +
//                               returnSlug(block?.settings?.url)
//                             }
//                             className="link color-link"
//                           >
//                             <span>{block?.settings?.title}</span>
//                           </Link>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             ) : (
//               <>
//                 <p>Noting Found!</p>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ReqTable;
