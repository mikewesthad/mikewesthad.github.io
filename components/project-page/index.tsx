import Main from "components/main";
import PageDescription from "components/page-description";
import PageTitle from "components/page-title";
import BackToPortfolio from "./back-to-portfolio-section";

interface ProjectPageProps {
  children: React.ReactNode;
  backTo: "dev" | "edu" | "art";
  pageTitle: string;
}

function ProjectPage({ backTo, pageTitle, children }: ProjectPageProps) {
  const description = `Michael Hadley&pos;s portfolio page for: ${pageTitle}`;
  return (
    <Main>
      <PageTitle>{pageTitle}</PageTitle>
      <PageDescription>{description}</PageDescription>
      {children}
      <BackToPortfolio backTo={backTo} />
    </Main>
  );
}

export default ProjectPage;
export type { ProjectPageProps };
