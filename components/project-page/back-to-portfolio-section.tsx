import Container from "components/container";
import Link from "components/link";

interface BackToPortfolioProps {
  backTo: "dev" | "edu" | "art";
}

const hrefMap = {
  dev: "/portfolio/dev",
  edu: "/portfolio/edu",
  art: "/portfolio/art",
};

function BackToPortfolio({ backTo }: BackToPortfolioProps) {
  const href = hrefMap[backTo];
  return (
    <Container tagName="section">
      <p>
        <Link href={href}>← Back to portfolio</Link>.
      </p>
    </Container>
  );
}

export default BackToPortfolio;
export type { BackToPortfolioProps };
