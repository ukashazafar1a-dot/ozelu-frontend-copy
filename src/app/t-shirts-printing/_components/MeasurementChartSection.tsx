"use client";
import { htmlDecode } from "@/helpers/generals";
import { Section } from "@/libs/schemaTypes";
import { Image } from "@/components/ui/Image";

type props = { section: Section | null };

export default function MeasurementChartSection({ section }: props) {
  if (!section?.settings) return null;
  const { title, image } = section.settings as { title?: string; image?: any };
  const imageObj =
    typeof image === "object" && image?.src
      ? image
      : typeof image === "string" && image
        ? { src: image, alt: title || "Size chart" }
        : null;
  if (!imageObj?.src) return null;

  return (
    <div className="margin-bottom container">
      {title && (
        <h2
          className="heading-h2 mt-5 mb-3 text-center"
          dangerouslySetInnerHTML={{ __html: htmlDecode(title) }}
        />
      )}
      <div className="t-shirts-measurement-chart mb-4">
        <Image
          image={imageObj}
          alt={title || "Size chart"}
          className="img-fluid mx-auto"
        />
      </div>
    </div>
  );
}
