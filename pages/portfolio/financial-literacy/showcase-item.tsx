import { ShowcaseItem } from "components/showcase";
import showcaseImage from "./images/budget-1.png";

interface FinancialLiteracyShowcaseItemProps {}

function FinancialLiteracyShowcaseItem({}: FinancialLiteracyShowcaseItemProps) {
  return (
    <ShowcaseItem
      href="/portfolio/financial-literacy"
      image={showcaseImage}
      title="Financial Literacy Games"
      subtitle="Client: CCC &amp; EAC"
    />
  );
}

export default FinancialLiteracyShowcaseItem;
export type { FinancialLiteracyShowcaseItemProps };
