import Link from "components/link";
import PageTitle from "components/page-title";
import Container from "components/container";
import Main from "components/main";
import PageDescription from "components/page-description";
import SocialPageMeta from "components/social-page-meta";

const PortfolioPage = () => {
  return (
    <Container>
      <PageTitle>Portfolio</PageTitle>
      <SocialPageMeta
        title="Portfolio"
        description="Michael Hadley's portfolio."
        path="/portfolio"
      />

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
