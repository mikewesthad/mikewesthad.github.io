import React from "react";
import { useRouter } from "next/router";
import Link from "../link";
import css from "./nav.module.scss";
import Container from "../container/container";
import { GitHubIconLink, LinkedInIconLink, YouTubeIconLink } from "../social-links/social-links";
import NavLink from "./nav-link";

function Nav() {
  return (
    <>
      <Container>
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
            <li>
              <ul className={css.socialLinks}>
                <li>
                  <GitHubIconLink />
                </li>
                <li>
                  <LinkedInIconLink />
                </li>
                <li>
                  <YouTubeIconLink />
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </Container>
      <hr />
    </>
  );
}

export default Nav;
