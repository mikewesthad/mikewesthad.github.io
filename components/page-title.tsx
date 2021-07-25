import React from "react";
import Head from "next/head";

interface PageTitleProps {
  children: string;
}

function PageTitle({ children }: PageTitleProps) {
  const formattedTitle = `mwh${children ? ` | ${children.toLowerCase()}` : ""}`;
  return (
    <Head>
      <title>{formattedTitle}</title>
    </Head>
  );
}

export default PageTitle;
export type { PageTitleProps };
