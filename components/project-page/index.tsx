import Main from "components/main";
import BackToPortfolio from "./back-to-portfolio-section";

interface ProjectPageProps {
  children: React.ReactNode;
  backTo: "dev" | "edu" | "art";
}

function ProjectPage({ backTo, children }: ProjectPageProps) {
  return (
    <Main>
      {children}
      <BackToPortfolio backTo={backTo} />
    </Main>
  );
}

export default ProjectPage;
export type { ProjectPageProps };
