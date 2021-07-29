import Link from "components/link";
import PageTitle from "components/page-title";
import Container from "components/container";

const PortfolioPage = () => {
  return (
    <Container tagName="main">
      <PageTitle>Portfolio</PageTitle>
      <h1>Portfolio</h1>
      <p>Want to see examples of my work? It's broken down into the following categories:</p>
      <ul>
        <li>
          <Link href="/work/dev">Development</Link>
        </li>
        <li>
          <Link href="/work/edu">Teaching</Link>
        </li>
        <li>
          <Link href="/work/art">Art</Link>
        </li>
      </ul>
    </Container>
  );
};

export default PortfolioPage;
