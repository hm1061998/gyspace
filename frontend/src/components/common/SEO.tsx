import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "GYSpace - Nền tảng học quán dụng ngữ thông minh, giúp bạn nâng cao vốn từ vựng và kỹ năng ngôn ngữ một cách hiệu quả.",
  name = "GYSpace",
  type = "website",
  keywords = "idioms, learning, chinese, vietnamese, education, quán dụng ngữ, học tiếng trung, từ vựng",
}) => {
  const siteTitle = title
    ? `${title} | ${name}`
    : `${name} - Học Quán Dụng Ngữ Thông Minh`;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};
