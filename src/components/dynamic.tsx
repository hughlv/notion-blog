import dynamic from 'next/dynamic'
import ExtLink from './ext-link'
import { XEmbed } from 'react-social-media-embed';

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
}
