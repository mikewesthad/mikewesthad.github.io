import BackToPortfolio from "./back-to-portfolio-section";

interface ProjectPageProps {
  children: React.ReactNode;
  backTo: "dev" | "edu" | "art";
}

function ProjectPage({ backTo, children }: ProjectPageProps) {
  return (
    <main>
      {children}
      <BackToPortfolio backTo={backTo} />
    </main>
  );
}

export default ProjectPage;
export type { ProjectPageProps };
