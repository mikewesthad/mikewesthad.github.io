import cn from "classnames";
import Container from ".";
import css from "./section.module.scss";

interface SectionProps {
  className?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}

function Section({ children, className, fullWidth }: SectionProps) {
  return (
    <Container tagName="section" fullWidth={fullWidth} className={cn(className, css.section)}>
      {children}
    </Container>
  );
}

export default Section;
export type { SectionProps };
