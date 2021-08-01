import { useRouter } from "next/router";
import Link from "components/link";
import css from "./nav-link.module.scss";
import React from "react";

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

  // Placeholder: blur nav links when the user clicks (or keyboard "clicks") on them
  // to close the dropdown and remove the focus. Verify this is accessible!
  const onClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (e.target === document.activeElement) {
      (document.activeElement as HTMLAnchorElement).blur();
    }
  };

  return (
    <Link className={className} href={href} anchorProps={{ onClick }}>
      {children}
    </Link>
  );
}

export default NavLink;
export type { NavLinkProps };
