import { useState } from "react";
import Image from "next/image";
import ExpandedImage from "./expanded-image";
import css from "./index.module.scss";

interface ExpandableImageProps {
  src: StaticImageData;
}

function ExpandableImage({ src }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const onClick = () => setIsExpanded(!isExpanded);
  const close = () => setIsExpanded(false);

  return (
    <div>
      {isExpanded && <ExpandedImage src={src} onClose={close} />}
      <Image
        src={src}
        onClick={onClick}
        className={css.expandableImage}
        layout="responsive"
        objectFit="cover"
        placeholder="blur"
      />
    </div>
  );
}

export default ExpandableImage;

export { ExpandedImage };
