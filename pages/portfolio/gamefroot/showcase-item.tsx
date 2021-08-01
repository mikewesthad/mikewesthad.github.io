import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/gamefroot-3.png";

interface GamefrootShowcaseItemProps {}

function GamefrootShowcaseItem({}: GamefrootShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/gamefroot"
      image={showcaseImage}
      title="Educational Game Engine"
      subtitle="Client: Gamefroot"
    />
  );
}

export default GamefrootShowcaseItem;
export type { GamefrootShowcaseItemProps };
