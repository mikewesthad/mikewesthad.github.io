import css from "./icon-link.module.scss";

interface IconLinkProps {
  href: string;
  children: React.ReactNode;
}

function IconLink({ href, children }: IconLinkProps) {
  return (
    <div>
      <a className={`unstyled-link ${css.iconLink}`} href={href}>
        {children}
      </a>
    </div>
  );
}

export default IconLink;
