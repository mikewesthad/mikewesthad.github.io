import { useRouter } from "next/router";
import Link from "components/link";
import css from "./nav-link.module.scss";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  tiltLeft?: boolean;
  exact?: boolean;
}

function NavLink({ href, children, tiltLeft = true, exact = false }: NavLinkProps) {
  const { pathname } = useRouter();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  let className = `unstyled-link ${tiltLeft ? css.tiltLeft : css.tiltRight} ${css.navLink}`;
  if (isActive) className += ` ${css.navLinkActive}`;
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

export default NavLink;
export type { NavLinkProps };
