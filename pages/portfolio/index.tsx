import * as React from "react";
import Link from "../../components/link";
import PageTitle from "../../components/page-title";

const PortfolioPage = () => {
  return (
    <main>
      <PageTitle>Work</PageTitle>
      <h1>Work</h1>
      <p>TODO! This will list the main categories of work.</p>
      <ul>
        <li>
          <Link href="/portfolio/dev">Development</Link>
        </li>
        <li>
          <Link href="/portfolio/art">Art</Link>
        </li>
        <li>
          <Link href="/portfolio/teaching">Teaching</Link>
        </li>
        <li>
          <Link href="/portfolio/teaching">Writing</Link>
        </li>
      </ul>
    </main>
  );
};

export default PortfolioPage;
