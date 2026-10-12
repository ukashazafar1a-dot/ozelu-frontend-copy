import { htmlDecode } from "@/helpers/generals";
import { Section, SectionBlock } from "@/libs/schemaTypes";
import React, { useMemo } from "react";
import { Image } from "./ui/Image";

type props = {
  section: Section | null;
  /** Card width follows image size (used on foam board display/mounting sections). */
  fitImageCards?: boolean;
  /** Align card descriptions when titles wrap to different heights (standard on marketing pages). */
  alignDescriptions?: boolean;
  /** Less space between section heading and picture cards (mugs printing page). */
  compactHeadingSpacing?: boolean;
};

function hasVisibleHtmlContent(html?: string | null) {
  if (!html) return false;
  const plain = htmlDecode(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;[^&]*&gt;/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
  return plain.length > 0;
}

function normalizeTypesBlocks(blocks: Section["blocks"] | Record<string, SectionBlock> | null | undefined) {
  if (!blocks) return [];
  const list = Array.isArray(blocks) ? blocks : Object.values(blocks);
  return list.filter((block) => {
    if (!block?.settings) return false;
    const { image, title, content } = block.settings;
    if (image?.src) return true;
    const plain = `${title || ""}${content || ""}`
      .replace(/<[^>]*>/g, "")
      .replace(/&lt;[^&]*&gt;/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
    return plain.length > 0;
  });
}

const TypesSection = ({
  section,
  fitImageCards = false,
  alignDescriptions = true,
  compactHeadingSpacing = false,
}: props) => {
  const blocks = useMemo(() => normalizeTypesBlocks(section?.blocks), [section?.blocks]);
  const sectionContent = section?.settings?.content;
  const showSectionContent = hasVisibleHtmlContent(sectionContent);

  return (
    <div
      className={`types-section${fitImageCards ? " types-section--fit-image" : ""}${alignDescriptions ? " types-section--align-descriptions" : ""}${compactHeadingSpacing ? " types-section--compact-heading" : ""}`}
      style={{
        background: section?.settings?.bgClr,
        color: section?.settings?.textClr,
      }}
    >
      <div className={`service-page-width${compactHeadingSpacing ? " px-3 pb-3" : " p-3"}`}>
        {section?.settings?.title && (
          <h2
            className={`heading-h2 text-center fw-bold${compactHeadingSpacing ? " mx-0" : " my-3"}`}
            dangerouslySetInnerHTML={{
              __html: htmlDecode(section?.settings?.title),
            }}
          />
        )}
        {showSectionContent && (
          <div
            className={`rte text-center content${compactHeadingSpacing ? " mb-2" : " mb-4"}`}
            dangerouslySetInnerHTML={{
              __html: htmlDecode(sectionContent),
            }}
          />
        )}
        {blocks.length > 0 && (
          <div
            className={`types-cards-flex d-flex overflow-x-auto smart_scroll mb-4 cards-${blocks.length}`}
          >
            {blocks.map((block, index) => {
              return (
                <div className="card text-center border-0" key={index}>
                  <div className="card-body p-3 d-flex flex-column">
                    <div
                      className={
                        fitImageCards
                          ? "types-card-image-wrap bg-light"
                          : "bg-light"
                      }
                    >
                      <Image image={block?.settings?.image} />
                    </div>
                    {block?.settings?.title && (
                      <h3
                        className={alignDescriptions ? "h2" : "mt-3 h2"}
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(block?.settings?.title),
                        }}
                      />
                    )}
                    {block?.settings?.content && (
                      <div
                        className={alignDescriptions ? "rte" : "rte mt-3"}
                        dangerouslySetInnerHTML={{
                          __html: htmlDecode(block?.settings?.content),
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TypesSection;
