import Blog from "components/blog";
import Main from "components/main";
import PageTitle from "components/page-title";

interface BlogPageProps {}

function BlogPage({}: BlogPageProps) {
  return (
    <Main>
      <PageTitle>Blog</PageTitle>
      <Blog />
    </Main>
  );
}

export default BlogPage;
export type { BlogPageProps };
