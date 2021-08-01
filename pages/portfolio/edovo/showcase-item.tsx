import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/codevolve-1.png";

interface EdovoShowcaseItemProps {}

function EdovoShowcaseItem({}: EdovoShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/edovo"
      image={showcaseImage}
      title="Incarcerated Learners"
      subtitle="Web Dev Classes for Edovo"
    />
  );
}

export default EdovoShowcaseItem;
export type { EdovoShowcaseItemProps };
