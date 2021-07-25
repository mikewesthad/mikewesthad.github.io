import * as React from "react";
import { GetStaticProps } from "next";
import { getAllProjects } from "../lib/api";
import Link from "../components/link";
import PageTitle from "../components/page-title";

const PortfolioPage = () => {
  return (
    <main>
      <PageTitle>Work</PageTitle>
      <h1>Work</h1>
      <p>TODO! This will list the main categories of work.</p>
      <ul>
        <li>Development</li>
        <li>Open Source Tools</li>
        <li>Art</li>
      </ul>
    </main>
  );
};

export default PortfolioPage;
