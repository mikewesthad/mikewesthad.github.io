import React from "react";
import { Link } from "gatsby";
import { nav, navList, navLogo } from "./nav.module.css";

function Nav() {
  return (
    <nav className={nav}>
      <Link to="/" className={navLogo}>
        mikewesthad
      </Link>
      <ul className={navList}>
        <li>
          <Link to="/">About</Link>
        </li>
        <li>
          <Link to="/work">Work</Link>
        </li>
        <li>
          <Link to="/blog">Blog</Link>
        </li>
        <li>
          <Link to="/youtube">YouTube</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Nav;
