import Section from "components/container/section";
import Link from "components/link";
import Main from "components/main";
import PageTitle from "components/page-title";

const NotFoundPage = () => {
  return (
    <Main>
      <PageTitle>Not Found!</PageTitle>
      <Section>
        <h1>Page Not Found</h1>
        <p>
          Uh oh! Sorry, I couldn&apos;t find the page you were looking for{" "}
          <span role="img" aria-label="Pensive emoji">
            👀
          </span>{" "}
          .
          <p>
            Try heading back to the <Link href="/">home page</Link>, or if something is wrong, get
            in <Link href="/contact">touch</Link>.
          </p>
        </p>
      </Section>
    </Main>
  );
};

export default NotFoundPage;
