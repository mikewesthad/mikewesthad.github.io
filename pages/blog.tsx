import Blog from "components/blog";
import Main from "components/main";
import PageTitle from "components/page-title";
import SocialPageMeta from "components/social-page-meta";
import ogImage from "../components/technical-writing-showcase/images/blog-1.png";

interface BlogPageProps {}

function BlogPage({}: BlogPageProps) {
  return (
    <Main>
      <PageTitle>Blog</PageTitle>
      <SocialPageMeta
        title="Blog"
        description="Michael Hadley's personal coding blog."
        image={ogImage}
        path="/contact"
      />
      <Blog />
    </Main>
  );
}

export default BlogPage;
export type { BlogPageProps };
