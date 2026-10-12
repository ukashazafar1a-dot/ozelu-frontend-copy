import { returnImage } from "@/helpers/generals";
import React, { useEffect, useState } from "react";

const EventGallery = ({section}:any) => {
  const [blocks, setBlocks] = useState<any>(null);
  //console.log(section);
  useEffect(() => {
    if (section) {
      setBlocks(section?.blocks);
    }
  }, [section]);
  //console.log('blocks',blocks)
  return (
    <section>
      <div className="services-tittle-photography">
        <div className="container-photography">
          <h2 className="fw-bold heading-h2 m-0 mb-3 text-md-left text-center">Our Event Photography Portfolio</h2>
        </div>
      </div>
      <div className="gallery-photography">
        <div className="container-photography">
          <div className="row pb-25">
            {blocks && blocks.length > 0 ? (
                blocks.map((block: any, index: number) => {
                  // Check if the image exists within block.settings and if it has a src
                  const imageExists =
                    block?.settings?.image && block?.settings?.image.src;
                  // Render the image block only if the image exists
                  return imageExists ? (
                    <div className="col-md-12 py-2 py-sm-3" key={block?._id}>
                      {returnImage(block?.settings?.image)}
                    </div>
                  ) : null;
                })
              ) : (
                <></>
              )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventGallery;
