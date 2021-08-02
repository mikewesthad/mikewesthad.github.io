import Link from "components/link";
import css from "./icon-link.module.scss";

interface IconLinkProps {
  href: string;
  children: React.ReactNode;
  screenReaderText: string;
}

function IconLink({ href, children, screenReaderText }: IconLinkProps) {
  return (
    <div>
      <Link showExternalIcon={false} className={`unstyled-link ${css.iconLink}`} href={href}>
        {children} <span className={css.screenReaderText}>{screenReaderText}</span>
      </Link>
    </div>
  );
}

export default IconLink;
