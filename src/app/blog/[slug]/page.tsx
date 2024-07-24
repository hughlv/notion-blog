import Link from 'next/link';
import Header from '@/components/header';
import Heading from '@/components/heading';
import components from '@/components/dynamic';
import blogStyles from '@/styles/blog.module.css';
import { getDateStr } from '@/utils/blog-helpers';
import { getBlogIndex, getPostData } from '@/utils/notion';
import React from 'react';
import { BlockObjectResponse, EmbedBlockObjectResponse, ImageBlockObjectResponse, ParagraphBlockObjectResponse, PartialBlockObjectResponse, VideoBlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

// This function gets called at build time
export async function generateStaticParams() {
  const postsTable = await getBlogIndex();
  return Object.keys(postsTable)
    .filter((post) => postsTable[post].Published)
    .map((slug) => ({ slug }));
}

export default async function BlogPost({ params, searchParams }: any) {
  const { slug } = params;
  const preview = searchParams.preview === 'true';

  const post = await getPostData(slug, preview);

  if (!post) {
    return (
      <div className={blogStyles.post}>
        <p>
          Woops! Didn't find that post, redirecting you back to the blog index
        </p>
      </div>
    );
  }

  return (
    <>
      <Header titlePre="Blog" />
      {preview && (
        <div className={blogStyles.previewAlertContainer}>
          <div className={blogStyles.previewAlert}>
            <b>Note:</b>
            {` `}Viewing in preview mode{' '}
            <Link href={`/api/clear-preview?slug=${post.Slug}`}>
              <button className={blogStyles.escapePreview}>Exit Preview</button>
            </Link>
          </div>
        </div>
      )}
      <article className={blogStyles.post}>
        <h1>{post.Page || ''}</h1>
        {post.Authors.length > 0 && (
          <div className="authors">By: {post.Authors.join(' ')}</div>
        )}
        {post.Date && (
          <div className="posted">Posted: {getDateStr(post.Date)}</div>
        )}

        <hr />

        {!post.Content || post.Content.length === 0 ? (
          <p>This post has no content</p>
        ) : (
          renderPostContent(post.Content)
        )}
      </article>
    </>
  );
}

function getParentId(parent: any): string | undefined {
  if (!parent) return undefined;
  if ('database_id' in parent) return parent.database_id;
  if ('page_id' in parent) return parent.page_id;
  if ('block_id' in parent) return parent.block_id;
  return undefined;
}

function renderPostContent(content: (BlockObjectResponse | PartialBlockObjectResponse)[]) {
  if (!content) return null;

  let listTagName: string | null = null;
  let listLastId: string | null = null;
  let listMap: {
    [id: string]: {
      key: string;
      isNested?: boolean;
      nested: string[];
      children: React.ReactNode;
    };
  } = {};

  return content.map((blockObject, blockIdx) => {
    if (!('type' in blockObject)) {
      // Simply ignore partial blocks
      return null;
    }
    const block = blockObject as BlockObjectResponse;
    const { type, id, parent, has_children } = block;
    const properties = (block as any).properties || {}; // Adjust based on actual data structure
    const isLast = blockIdx === content.length - 1;
    const isList = ['bulleted_list_item', 'numbered_list_item'].includes(type);
    let toRender: React.ReactNode[] = [];

    if (isList) {
      listTagName = components[type === 'bulleted_list_item' ? 'ul' : 'ol'];
      listLastId = `list${id}`;

      listMap[id] = {
        key: id,
        nested: [],
        children: textBlock(properties.title, true, id),
      };

      const parentId = getParentId(parent);
      if (parentId && listMap[parentId]) {
        listMap[id].isNested = true;
        listMap[parentId].nested.push(id);
      }
    }

    if (listTagName && (isLast || !isList)) {
      toRender.push(
        React.createElement(
          listTagName,
          { key: listLastId! },
          Object.keys(listMap).map((itemId) => {
            if (listMap[itemId].isNested) return null;

            const createEl = (item: any) =>
              React.createElement(
                components.li || 'li',
                { key: item.key },
                item.children,
                item.nested.length > 0
                  ? React.createElement(
                    components.ul || 'ul',
                    { key: item + 'sub-list' },
                    item.nested.map((nestedId: string) =>
                      createEl(listMap[nestedId])
                    )
                  )
                  : null
              );
            return createEl(listMap[itemId]);
          })
        )
      );
      listMap = {};
      listLastId = null;
      listTagName = null;
    }

    const renderHeading = (Tag: 'h1' | 'h2' | 'h3') => {
      let heading;
      if (Tag === 'h1') {
        heading = (block as any).heading_1;
      } else if (Tag === 'h2') {
        heading = (block as any).heading_2;
      } else if (Tag === 'h3') {
        heading = (block as any).heading_3;
      }
      toRender.push(
        <Heading key={id}>
          <Tag>{textBlock(heading?.rich_text, true, id)}</Tag>
        </Heading>
      );
    };

    switch (type) {
      case 'divider':
        break;
      case 'paragraph':
        const { paragraph } = block as ParagraphBlockObjectResponse; // Adjust based on actual data structure
        if (paragraph.rich_text) {
          toRender.push(textBlock(paragraph.rich_text, false, id));
        }
        break;
      case 'image':
        const { image } = block as ImageBlockObjectResponse; // Adjust based on actual data structure
        if (image && image.type === 'external') {
          toRender.push(
            <img
              key={id}
              src={image.external.url}
              alt={`An image from Notion`}
            />
          );
        }
        break;
      case 'video':
        const { video } = block as VideoBlockObjectResponse; // Adjust based on actual data structure
        if (video && video.type === 'external') {
          toRender.push(
            <video
              key={id}
              src={video.external.url}
              controls
              loop
              muted
              autoPlay
            />
          );
        }
        break;
      case 'embed': {
        const { embed } = block as EmbedBlockObjectResponse; // Adjust based on actual data structure
        if (!embed || !embed.url) break;
        if (embed.url.startsWith('https://x.com')) {
          // toRender.push(<components.XEmbed url={embed.url} width={325} />);
        } else {
          toRender.push(<iframe src={embed.url} />);
        }
        break;
      }
      case 'heading_1':
        renderHeading('h1');
        break;
      case 'heading_2':
        renderHeading('h2');
        break;
      case 'heading_3':
        renderHeading('h3');
        break;
      case 'code': {
        if (properties.rich_text) {
          const content = properties.rich_text[0]?.plain_text;
          const language = properties.language;

          toRender.push(
            <components.Code key={id} language={language || ''}>
              {content}
            </components.Code>
          );
        }
        break;
      }
      case 'quote': {
        if (properties.rich_text) {
          toRender.push(
            React.createElement(
              components.blockquote,
              { key: id },
              properties.rich_text.map((text: any) => text.plain_text).join('')
            )
          );
        }
        break;
      }
      case 'callout': {
        toRender.push(
          <div className="callout" key={id}>
            {(block as any).format?.page_icon && (
              <div>{(block as any).format?.page_icon}</div>
            )}
            <div className="text">
              {textBlock(properties.rich_text, true, id)}
            </div>
          </div>
        );
        break;
      }
      case 'embed': {
        if (properties.html) {
          toRender.push(
            <div
              dangerouslySetInnerHTML={{ __html: properties.html }}
              key={id}
            />
          );
        }
        break;
      }
      case 'equation': {
        if (properties && properties.rich_text) {
          const content = properties.rich_text[0]?.plain_text;
          toRender.push(
            <components.Equation key={id} displayMode={true}>
              {content}
            </components.Equation>
          );
        }
        break;
      }
      default:
        if (
          process.env.NODE_ENV !== 'production' &&
          !['bulleted_list_item', 'numbered_list_item'].includes(type)
        ) {
          console.log('unknown type', type);
        }
        break;
    }
    return toRender;
  });
}

// Function to render annotations (bold, italic, etc.)
const renderAnnotations = (textItem: any) => {
  let content = textItem.plain_text;
  const { annotations } = textItem;

  if (annotations.bold) content = <strong>{content}</strong>;
  if (annotations.italic) content = <em>{content}</em>;
  if (annotations.strikethrough) content = <s>{content}</s>;
  if (annotations.underline) content = <u>{content}</u>;
  if (annotations.code) content = <code>{content}</code>;

  return content;
};

// Updated textBlock function
function textBlock(text: any[], noPTag = false, id?: any) {
  if (!text || !Array.isArray(text)) {
    return null;
  }

  const textContent = text.map((textItem, i) => (
    <React.Fragment key={i}>
      {renderAnnotations(textItem)}
      {i < text.length - 1 && <br />}
    </React.Fragment>
  ));

  return noPTag ? textContent : <p key={id}>{textContent}</p>;
}
