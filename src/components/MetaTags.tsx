import { Helmet } from 'react-helmet-async';

interface Props {
  title?: string;
  description?: string;
  path?: string;
}

const BASE = 'MetaLearning';
const BASE_URL = import.meta.env.VITE_APP_URL || 'https://project-ap4pe.vercel.app';
const DEFAULT_DESC =
  'Transform education with interactive 3D lessons powered by AI. Share lessons instantly with PIN codes. Works on any browser — no hardware required.';

export function MetaTags({ title, description, path = '' }: Props) {
  const fullTitle = title ? `${title} | ${BASE}` : BASE;
  const url = `${BASE_URL}${path}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description ?? DEFAULT_DESC} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description ?? DEFAULT_DESC} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${BASE_URL}/og-image.svg`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description ?? DEFAULT_DESC} />
      <link rel="canonical" href={url} />
    </Helmet>
  );
}
