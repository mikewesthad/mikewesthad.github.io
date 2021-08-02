import Head from "next/head";

interface PageDescriptionProps {
  children: string;
}

function PageDescription({ children }: PageDescriptionProps) {
  return (
    <Head>
      <meta name="description" content={children} />
    </Head>
  );
}

export default PageDescription;
export type { PageDescriptionProps };
