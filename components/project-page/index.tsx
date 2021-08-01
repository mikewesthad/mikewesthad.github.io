import Main from "components/main";
import PageTitle from "components/page-title";
import BackToPortfolio from "./back-to-portfolio-section";

interface ProjectPageProps {
  children: React.ReactNode;
  backTo: "dev" | "edu" | "art";
  pageTitle: string;
}

function ProjectPage({ backTo, pageTitle, children }: ProjectPageProps) {
  return (
    <Main>
      <PageTitle>{pageTitle}</PageTitle>
      {children}
      <BackToPortfolio backTo={backTo} />
    </Main>
  );
}

export default ProjectPage;
export type { ProjectPageProps };
