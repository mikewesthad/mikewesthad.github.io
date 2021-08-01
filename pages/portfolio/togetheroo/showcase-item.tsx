import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/togetheroo-4.png";

interface TogetherooShowcaseItemProps {}

function TogetherooShowcaseItem({}: TogetherooShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/togetheroo"
      image={showcaseImage}
      title="Playful Video Chat Platform"
      subtitle="Client: Togetheroo"
    />
  );
}

export default TogetherooShowcaseItem;
export type { TogetherooShowcaseItemProps };
