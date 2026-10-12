import { Site } from "@/libs/site";
import { Image as ImageType } from "@/libs/types";
import { generateImageSources } from "@/libs/utils";
import * as React from "react";

// Image component definition
const Image = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement> & {
    image?: ImageType;
    placeholder?: string;
  }
>(({ className, image, alt, ...props }, ref) => {
  // Use the image or fallback to placeholder
  const imageSrc = image?.src || Site.placeholder?.image || "";
  const { dataSrc, srcSet } = image
    ? generateImageSources(image)
    : { dataSrc: imageSrc, srcSet: "" };

  return (
    <img
      ref={ref}
      src={dataSrc}
      data-src={dataSrc}
      data-srcset={srcSet}
      className={`lazyload ${className || ""}`}
      alt={image?.alt ? image?.alt : alt}
      {...props}
    />
  );
});

Image.displayName = "Image";

export { Image };
