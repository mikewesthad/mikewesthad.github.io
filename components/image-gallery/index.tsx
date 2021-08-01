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
        const isLast = i === images.length - 1;
        const isOdd = i % 2 === 0;
        const isOrphan = isLast && isOdd;
        const className = cn(css.image, isOrphan && css.imageLast);

        return (
          <li key={i} className={className}>
            <ExpandableImage src={img} />
          </li>
        );
      })}
    </Section>
  );
}

export default ImageGallery;
export type { ImageGalleryProps };
