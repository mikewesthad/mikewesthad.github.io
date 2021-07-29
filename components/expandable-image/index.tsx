import { useState } from "react";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";
import css from "./index.module.scss";

interface ExpandedImageProps {
  children: React.ReactNode;
  onClose: () => void;
}

function ExpandedImage({ children, onClose }: ExpandedImageProps) {
  return (
    <div className={css.expandedImageWrapper}>
      <button onClick={onClose} className={css.closeButton}>
        <IoMdClose />
      </button>
      {children}
    </div>
  );
}

interface ExpandableImageProps {
  src: StaticImageData;
}

function ExpandableImage({ src }: ExpandableImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const onClick = () => setIsExpanded(!isExpanded);
  const close = () => setIsExpanded(false);

  return (
    <div>
      {isExpanded && (
        <ExpandedImage onClose={close}>
          <Image src={src} onClick={onClick} className={css.expandableImage} />
        </ExpandedImage>
      )}
      <Image src={src} onClick={onClick} className={css.expandableImage} />
    </div>
  );
}

export default ExpandableImage;
