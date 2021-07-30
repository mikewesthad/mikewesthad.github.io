import { ShowcaseItem } from "components/showcase";
import participateImage from "./images/participate-action-plan-1.png";

interface ParticipateShowcaseItemProps {}

function ParticipateShowcaseItem({}: ParticipateShowcaseItemProps) {
  return (
    <ShowcaseItem
      image={participateImage}
      title="Games for Educators"
      subtitle="Client: Participate"
    />
  );
}

export default ParticipateShowcaseItem;
export type { ParticipateShowcaseItemProps };
