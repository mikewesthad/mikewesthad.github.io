import Showcase, { ShowcaseItem } from "components/showcase";
import matterImage from "./images/matter-collision-1.png";
import boundLinesImage from "./images/bound-lines.png";
import macroscopeImage from "./images/macroscope-exterior-amir.png";

interface ArtDevShowcaseProps {}

function ArtDevShowcase({}: ArtDevShowcaseProps) {
  return (
    <Showcase>
      <ShowcaseItem
        href="https://encodedobjects.com/projects/macroscope/"
        image={macroscopeImage}
        title="Macroscope"
        subtitle="Penn State C++ Installation"
      />
      <ShowcaseItem
        href="https://encodedobjects.com/projects/bound-lines/"
        image={boundLinesImage}
        title="Bound Lines"
        subtitle="JS Data Viz Print"
      />
    </Showcase>
  );
}

export default ArtDevShowcase;
export type { ArtDevShowcaseProps };
