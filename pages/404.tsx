import * as React from "react";
import Link from "../components/link";
import PageTitle from "../components/page-title";

const NotFoundPage = () => {
  return (
    <main>
      <PageTitle>Not Found!</PageTitle>
      <h1>Page Not Found</h1>
      <p>
        Uh oh! Sorry, I couldn't find the page you were looking for{" "}
        <span role="img" aria-label="Pensive emoji">
          👀
        </span>{" "}
        .
        <p>
          Try heading back to the <Link href="/">home page</Link>, or if something is wrong, get in{" "}
          <Link href="/contact">touch</Link>.
        </p>
      </p>
    </main>
  );
};

export default NotFoundPage;