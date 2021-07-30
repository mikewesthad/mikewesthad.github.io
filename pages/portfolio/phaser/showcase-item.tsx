import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/phaser-1.png";

interface PhaserShowcaseItemProps {}

function PhaserShowcaseItem({}: PhaserShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/phaser"
      image={showcaseImage}
      title="Open Source Game Engine"
      subtitle="Client: Phaser"
    />
  );
}

export default PhaserShowcaseItem;
export type { PhaserShowcaseItemProps };
