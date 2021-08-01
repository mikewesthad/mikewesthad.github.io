import css from "./icon-link.module.scss";

interface IconLinkProps {
  href: string;
  children: React.ReactNode;
  screenReaderText: string;
}

function IconLink({ href, children, screenReaderText }: IconLinkProps) {
  return (
    <div>
      <a className={`unstyled-link ${css.iconLink}`} href={href}>
        {children} <span className={css.screenReaderText}>{screenReaderText}</span>
      </a>
    </div>
  );
}

export default IconLink;
