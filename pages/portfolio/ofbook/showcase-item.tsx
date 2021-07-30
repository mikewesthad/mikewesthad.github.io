import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/tangents.png";

interface OFBookShowcaseItemProps {}

function OFBookShowcaseItem({}: OFBookShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/ofbook"
      image={showcaseImage}
      title="ofBook"
      subtitle="Open Source Book on Creative Coding"
    />
  );
}

export default OFBookShowcaseItem;
export type { OFBookShowcaseItemProps };
