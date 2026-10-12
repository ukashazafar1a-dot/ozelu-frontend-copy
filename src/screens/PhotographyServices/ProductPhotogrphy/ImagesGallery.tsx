"use client";
import { returnImage } from "@/helpers/generals";
import React, { useEffect, useState } from "react";

const ImagesGallery = ({ section }: any) => {
  const [blocks, setBlocks] = useState<any>(null);
  //console.log(section);
  useEffect(() => {
    if (section) {
      setBlocks(section?.blocks);
    }
  }, [section]);
  //console.log('blocks',blocks)
  return (
    <section className="services-tittle-photography index-section">
      <div className="services-tittle-photography">
        <div className="container-photography">
          <h2 className="fw-bold heading-h2 m-0 mb-5 text-center">
            Our Product Photography Portfolio
          </h2>
        </div>
      </div>
      <div className="container-photography  px-3 px-md-0 mb-4 ">
        <div className="row mx-0">
          {blocks && blocks.length > 0 ? (
            blocks.map((block: any, index: number) => {
              // Check if the image exists within block.settings and if it has a src
              const imageExists =
                block?.settings?.image && block?.settings?.image.src;
              // Render the image block only if the image exists
              return imageExists ? (
                <div className="col-md-4 m-0 p-1" key={block?._id}>
                  {returnImage(block?.settings?.image,'example-class',512)}
                </div>
              ) : null;
            })
          ) : (
            <></>
          )}
        </div>
      </div>
    </section>
  );
};

export default ImagesGallery;
