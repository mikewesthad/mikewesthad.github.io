import { ShowcaseItem } from "components/showcase";
import participateImage from "./images/quiz-2.png";

interface ParticipateShowcaseItemProps {}

function ParticipateShowcaseItem({}: ParticipateShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/participate"
      image={participateImage}
      title="Games for Educators"
      subtitle="Client: Participate"
    />
  );
}

export default ParticipateShowcaseItem;
export type { ParticipateShowcaseItemProps };
