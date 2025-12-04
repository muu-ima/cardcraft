"use client";

import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

type TemplateImageProps = {
  src: string;
  width: number;
  height: number;
};

export function TemplateImage({ src, width, height }: TemplateImageProps) {
  const [img] = useImage(src, "anonymous");
  return img ? (
    <KonvaImage image={img} width={width} height={height} />
  ) : null;
}
