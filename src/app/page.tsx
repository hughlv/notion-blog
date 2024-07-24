import Header from '@/components/header'
import ExtLink from '@/components/ext-link'
import Features from '@/components/features'
import sharedStyles from '@/styles/shared.module.css'

export default function Index() {
  return (
    <>
      <Header titlePre="Home" />
      <div className={sharedStyles.layout}>
        <img
          src="/vercel-and-notion.png"
          height="85"
          width="250"
          alt="Vercel + Notion"
        />
        <h1>My Notion Blog</h1>
        <h2>
          Blazing Fast Notion Blog with Next.js'{' '}
          <ExtLink
            href="https://github.com/vercel/next.js/issues/9524"
            className="dotted"
            style={{ color: 'inherit' }}
          >
            SSG
          </ExtLink>
        </h2>

        <Features />

        <div className="explanation">
          <p>
            This is a statically generated{' '}
            <ExtLink href="https://nextjs.org">Next.js</ExtLink> site with a{' '}
            <ExtLink href="https://notion.so">Notion</ExtLink> powered blog that
            is deployed with <ExtLink href="https://vercel.com">Vercel</ExtLink>
            . It leverages some cool new features of Next.js 14
            which allow us to achieve all of the benefits listed above including
            blazing fast speeds, great local editing experience, and always
            being available!
          </p>

          <p>
            Get started by creating a new page in Notion and clicking the deploy
            button below. After you supply your token and the blog index id (the
            page's id in Notion) we will automatically create the table for you!
            See{' '}
            <ExtLink href="https://github.com/lyuai/notion-blog#getting-blog-index-and-token">
              here in the readme
            </ExtLink>{' '}
            for finding the new page's id.
          </p>
        </div>
      </div>
    </>
  )
}
