import cn from "classnames";
import Container from ".";
import css from "./section.module.scss";

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  tagName?: keyof JSX.IntrinsicElements;
}

function Section({ children, className, tagName = "section", fullWidth = false }: SectionProps) {
  return (
    <Container tagName={tagName} fullWidth={fullWidth} className={cn(className, css.section)}>
      {children}
    </Container>
  );
}

export default Section;
export type { SectionProps };
