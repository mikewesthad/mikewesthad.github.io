import Showcase, { ShowcaseItem } from "components/showcase";
import matterImage from "./images/matter-collision-1.png";
import navmeshImage from "./images/navmesh-1.png";
import extruderImage from "./images/tile-extruder-1.png";

interface OpenSourceShowcaseProps {}

function OpenSourceShowcase({}: OpenSourceShowcaseProps) {
  return (
    <Showcase>
      <ShowcaseItem
        href="https://github.com/mikewesthad/navmesh"
        image={navmeshImage}
        title="NavMesh"
        subtitle="Fast Pathfinding"
      />
      <ShowcaseItem
        href="https://github.com/mikewesthad/phaser-matter-collision-plugin"
        image={matterImage}
        title="Phaser Matter Collision Plugin"
        subtitle="Physics Plugin"
      />

      <ShowcaseItem
        href="https://github.com/sporadic-labs/tile-extruder"
        image={extruderImage}
        title="Tile Extruder"
        subtitle="Game Asset Optimizer"
      />
    </Showcase>
  );
}

export default OpenSourceShowcase;
export type { OpenSourceShowcaseProps };
