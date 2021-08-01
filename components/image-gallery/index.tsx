import Section from "components/container/section";
import ExpandableImage from "components/expandable-image";
import cn from "classnames";
import css from "./index.module.scss";

interface ImageGalleryProps {
  images: StaticImageData[];
}

function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <Section tagName="ul" className={css.grid} fullWidth>
      {images.map((img, i) => {
        return (
          <li key={i} className={css.image}>
            <ExpandableImage src={img} />
          </li>
        );
      })}
    </Section>
  );
}

export default ImageGallery;
export type { ImageGalleryProps };
