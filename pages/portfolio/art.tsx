import Section from "components/container/section";
import Emoji from "components/emoji";
import Link from "components/link";
import Main from "components/main";
import PageTitle from "components/page-title";
import SocialPageMeta from "components/social-page-meta";

function ArtPage() {
  return (
    <Main>
      <PageTitle>Art</PageTitle>
      <SocialPageMeta
        title="Art Portfolio"
        description="Michael Hadley's portfolio as an artist."
        path="/portfolio/art"
      />

      <Section>
        <h1>Art Portfolio</h1>
        <p>Coming soon!</p>
        <p>
          This website is in the process of being updated. This page will feature selected art works
          soon. Check back in a couple days <Emoji ariaLabel="Calendar">📅</Emoji>.
        </p>
        <p>
          In the meantime, check out <Link href="https://encodedobjects.com/">Encoded Objects</Link>
          , a collaboration with artist Jonathan Rockford that explores our connection to the
          environment through the lens of technology.
        </p>
      </Section>
    </Main>
  );
}

export default ArtPage;
