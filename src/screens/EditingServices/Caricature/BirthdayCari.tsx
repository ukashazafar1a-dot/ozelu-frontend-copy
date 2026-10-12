"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const BirthdayCari = ({ section }: any) => {
  const [blocks, setBlocks] = useState<any>(null);
  //console.log(section);
  useEffect(() => {
    if (section) {
      setBlocks(section?.blocks);
    }
  }, [section]);
  //console.log('blocks',blocks)
  return (
    <section className="birthday-caricatures">
      <div className="caricature-head py-3">
        <h2>BIRTHDAY CARICATURES</h2>
      </div>
      <div className="caricature-images">
        <div className="container">
          <div className="row justify-content-center">
          {blocks && blocks.length > 0 ?
              blocks.map((block: any, index: number) => {
                // Check if the image exists within block.settings and if it has a src
                const src = block?.settings?.image?.src;
                // Render the image block only if the image exists
                return src ? (
                  <div className="col-12 col-md-4 caricature-img--wrapper" key={index}>
                    <div className="caricature-img relative">
                      <Image
                        src={src}
                        alt={`Wedding caricature ${index + 1}`}
                        fill
                        sizes="(max-width: 786px) 100vw, 33vw"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null;
              })
             : <></>}
          </div>
          <div className="caricature-btn--wrapper">
            <a href="https://wa.me/971545679479">
              <button className="caricature-btn">WHATSAPP FOR QUOTE</button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BirthdayCari;
