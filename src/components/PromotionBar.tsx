/**
 * PromotionBar Section Component
 * -------------------------------------------
 * This component renders a rich text section with:
 *  - Title (richtext)
 *  - Content (richtext)
 *  - Background + Text color (optional)
 *
 * 🔹 REQUIRED SCHEMA (from the Section Builder CMS)
 * {
 *   "name": "Rich Text",
 *   "type": "richtext",
 *   "settings": [
 *     {
 *       "type": "richtext",
 *       "id": "title",
 *       "label": "Title"
 *     },
 *     {
 *       "type": "richtext",
 *       "id": "content",
 *       "label": "Content"
 *     }
 *   ],
 *   "blocks": []
 * }
 *
 * 🔹 EXPECTED SETTINGS DATA FORMAT
 * "richtext": {
 *   "settings": {
 *     "title": "<p><b>Same day delivery…</b></p>",
 *     "content": "<p>In most cases delivery…</p>"
 *   }
 * }
 *
 * Notes:
 * - Both `title` and `content` should be HTML strings.
 * - Component safely decodes HTML using `htmlDecode`.
 * - Colors (bgClr, textClr) are optional.
 */

import { htmlDecode } from "@/helpers/generals";
import React from "react";

const PromotionBar = ({ section }: any) => {
  return (
    <section className="servics-tittle rich-text-section"
      style={{
        background: section?.settings?.bgClr || "#D3F994",
        color: section?.settings?.textClr || "#000",
      }}>
      <div className="container py-4 px-3">
        <div className="text-center">
          {section?.settings?.title && (
            <h2
              className="mb-3 h3"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.title),
              }}
            />
          )}
          {section?.settings?.content && (
            <div
              className="content text-center"
              dangerouslySetInnerHTML={{
                __html: htmlDecode(section?.settings?.content),
              }}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PromotionBar;
