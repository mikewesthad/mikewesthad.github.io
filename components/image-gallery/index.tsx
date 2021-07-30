import Container from "components/container";
import css from "./index.module.scss";

interface ImageGalleryProps {
  children: React.ReactNode;
}

function ImageGallery({ children }: ImageGalleryProps) {
  return (
    <Container tagName="ul" className={css.grid} fullWidth>
      {children}
    </Container>
  );
}

export default ImageGallery;
export type { ImageGalleryProps };
