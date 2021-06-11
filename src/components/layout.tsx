import React from "react";
import { Helmet } from "react-helmet";
import Nav from "./nav";
import { layout, layoutContents } from "./layout.module.css";
import Footer from "./footer";

type LayoutProps = {
  pageTitle: string;
  children: React.ReactNode;
};

function Layout({ pageTitle, children }: LayoutProps) {
  return (
    <div className={layout}>
      <Helmet titleTemplate="mikewesthad — %s" title={pageTitle} />
      <Nav />
      <main className={layoutContents}>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
