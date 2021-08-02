import Link from "components/link";
import PageTitle from "components/page-title";
import Container from "components/container";
import Main from "components/main";
import PageDescription from "components/page-description";

const PortfolioPage = () => {
  return (
    <Container>
      <PageTitle>Portfolio</PageTitle>
      <PageDescription>Michael Hadley&apos;s portfolio.</PageDescription>
      <Main>
        <h1>Portfolio</h1>
        <p>
          Want to see examples of my work? My portfolio is broken down into the following
          categories:
        </p>
        <ul>
          <li>
            <Link href="/portfolio/dev">Development</Link>
          </li>
          <li>
            <Link href="/portfolio/edu">Teaching</Link>
          </li>
          <li>
            <Link href="/portfolio/art">Art</Link>
          </li>
        </ul>
      </Main>
    </Container>
  );
};

export default PortfolioPage;
