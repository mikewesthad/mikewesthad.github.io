import Section from "components/container/section";
import Main from "components/main";
import PageTitle from "components/page-title";

function ArtPage() {
  return (
    <Main>
      <PageTitle>Art</PageTitle>
      <Section>
        <h1>Art Portfolio</h1>
        <p>Coming soon!</p>
        <p>
          This website is in the process of being updated. This page will feature selected art works
          soon. Check back in a couple days 📅.
        </p>
        <p>
          In the meantime, check out <a href="https://encodedobjects.com/">Encoded Objects</a>, a
          collaboration with artist Jonathan Rockford that explores our connection to the
          environment through the lens of technology.
        </p>
      </Section>
    </Main>
  );
}

export default ArtPage;
