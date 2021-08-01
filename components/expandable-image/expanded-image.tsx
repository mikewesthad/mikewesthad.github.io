import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useWindowSize } from "@react-hook/window-size/throttled";
import { IoMdClose } from "react-icons/io";
import IconButton from "./icon-button";
import css from "./index.module.scss";

interface ExpandedImageProps {
  src: StaticImageData;
  onClose: () => void;
}

function ExpandedImage({ src, onClose }: ExpandedImageProps) {
  const [windowWidth, windowHeight] = useWindowSize({ fps: 60, leading: true });

  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { width, height } = ref.current!.getBoundingClientRect();
    const w = src.width;
    const h = src.height;
    const xFit = width / w;
    const yFit = height / h;
    const scale = Math.min(xFit, yFit);
    const scaledWidth = scale * src.width;
    const scaledHeight = scale * src.height;
    setImgSize({ width: scaledWidth, height: scaledHeight });
  }, [windowWidth, windowHeight]);

  const onClick: React.MouseEventHandler<HTMLElement> = (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName !== "IMG") {
      onClose();
    }
  };

  return (
    <div className={css.fixedContainer} onClick={onClick}>
      <IconButton onClick={onClose} className={css.closeButton}>
        <IoMdClose />
      </IconButton>
      <div className={css.expandedImageZone} ref={ref}>
        <div
          className={css.expandedImageWrapper}
          style={{
            ...imgSize,
          }}
        >
          <Image src={src} {...imgSize} layout="responsive" placeholder="blur" alt="" />
        </div>
      </div>
    </div>
  );
}

export default ExpandedImage;
export type { ExpandedImageProps };
