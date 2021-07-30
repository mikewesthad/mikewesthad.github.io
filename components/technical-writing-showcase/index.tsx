import Showcase, { ShowcaseItem } from "components/showcase";
import OFBookShowcaseItem from "pages/portfolio/ofbook/showcase-item";

interface TechnicalWritingShowcaseProps {}

function TechnicalWritingShowcase({}: TechnicalWritingShowcaseProps) {
  return (
    <Showcase>
      <OFBookShowcaseItem />
    </Showcase>
  );
}

export default TechnicalWritingShowcase;
export type { TechnicalWritingShowcaseProps };
