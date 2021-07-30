import Showcase, { ShowcaseItem } from "components/showcase";
import performanceImage from "./images/p5-performance-1.png";
import blogImage from "./images/blog-1.png";
import OFBookShowcaseItem from "pages/portfolio/ofbook/showcase-item";
import EdovoShowcaseItem from "pages/portfolio/edovo/showcase-item";

interface TechnicalWritingShowcaseProps {}

function TechnicalWritingShowcase({}: TechnicalWritingShowcaseProps) {
  return (
    <Showcase>
      <OFBookShowcaseItem />
      <ShowcaseItem
        href="https://github.com/mikewesthad/p5-performance-tips"
        image={performanceImage}
        title="p5 Performance Article"
        subtitle="Measuring &amp; Optimizing JS in p5"
      />
      <ShowcaseItem
        href="/blog"
        image={blogImage}
        title="Making Games in JS"
        subtitle="5-Part Blog Series"
      />
      <EdovoShowcaseItem />
    </Showcase>
  );
}

export default TechnicalWritingShowcase;
export type { TechnicalWritingShowcaseProps };
