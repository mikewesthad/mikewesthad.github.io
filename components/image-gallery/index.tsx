import Section from "components/container/section";
import css from "./index.module.scss";

interface ImageGalleryProps {
  children: React.ReactNode;
}

function ImageGallery({ children }: ImageGalleryProps) {
  return (
    <Section tagName="ul" className={css.grid} fullWidth>
      {children}
    </Section>
  );
}

export default ImageGallery;
export type { ImageGalleryProps };
