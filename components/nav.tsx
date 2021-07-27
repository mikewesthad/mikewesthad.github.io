import React from "react";
import { useRouter } from "next/router";
import Link from "./link";
import css from "./nav.module.scss";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}

function NavLink({ href, children, exact = false }: NavLinkProps) {
  const { pathname } = useRouter();
  const isActive = exact ? pathname === href : pathname.startsWith(href);
  let className = `unstyled-link ${css.navLink}`;
  if (isActive) className += ` ${css.navLinkActive}`;
  return (
    <Link className={className} href={href}>
      {children}
    </Link>
  );
}

function Nav() {
  return (
    <nav className={css.nav}>
      <Link href="/" className={`unstyled-link ${css.navLogo}`}>
        mikewesthad
      </Link>
      <ul className={css.navList}>
        <li className={css.dropdownTrigger}>
          <NavLink href="/" exact={true}>
            Portfolio
          </NavLink>
          <ul className={css.dropdownList}>
            <li>
              <NavLink href="/dev">Dev</NavLink>
            </li>
            <li>
              <NavLink href="/edu">Edu</NavLink>
            </li>
            <li>
              <NavLink href="/art">Art</NavLink>
            </li>
          </ul>
        </li>
        <li>
          <NavLink href="/blog">Blog</NavLink>
        </li>
        <li>
          <NavLink href="/contact">Contact</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
