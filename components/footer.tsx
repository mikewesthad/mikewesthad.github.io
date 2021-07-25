import React from "react";
import { IoLogoGithub, IoLogoLinkedin } from "react-icons/io5";
import css from "./footer.module.scss";

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={css.footerContainer}>
      <div>&copy; Michael Hadley {year}</div>
      <div className={css.socialLinks}>
        <a className="unstyled-link" href="https://github.com/mikewesthad">
          <IoLogoGithub />
        </a>
        <a className="unstyled-link" href="https://www.linkedin.com/in/michaelwesthadley/">
          <IoLogoLinkedin />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
