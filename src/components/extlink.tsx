import Link from 'next/link';

const ExtLink = ({ href, ...props }: any) => (
  <Link
    href={href}
    {...props}
    rel="noopener"
    target={props.target || '_blank'}
  />
);
export default ExtLink;
