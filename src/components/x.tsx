'use client';
import { XEmbed as EmbedComp } from 'react-social-media-embed';

const XEmbed = ({ url, width }: any) => {
  return <EmbedComp url={url} width={width} />;
};

export default XEmbed;
