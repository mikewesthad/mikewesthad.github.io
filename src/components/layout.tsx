import React from "react";
import { Helmet } from "react-helmet";
import Nav from "./nav";

type LayoutProps = {
  pageTitle: string;
  children: React.ReactNode;
};

function Layout({ pageTitle, children }: LayoutProps) {
  const year = new Date().getFullYear();
  return (
    <main>
      <Helmet titleTemplate="mikewesthad — %s" title={pageTitle} />
      <Nav />
      {children}
      <footer>
        <div>&copy; Michael West Hadley {year}</div>
        <ul>
          <li>email</li>
          <li>github</li>
          <li>linkedin</li>
        </ul>
      </footer>
    </main>
  );
}

export default Layout;
