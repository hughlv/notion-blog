import dynamic from 'next/dynamic';
import ExtLink from './extlink';

export default {
  // default tags
  ol: 'ol',
  ul: 'ul',
  li: 'li',
  p: 'p',
  blockquote: 'blockquote',
  a: ExtLink,

  Code: dynamic(() => import('./code'), { ssr: false }),
  Counter: dynamic(() => import('./counter'), { ssr: false }),
  Equation: dynamic(() => import('./equation'), { ssr: false }),
  XEmbed: dynamic(() => import('./x'), { ssr: false }),
};
