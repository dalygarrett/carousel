import * as React from "react";
import "../index.css";
import {
  Template,
  GetPath,
  GetHeadConfig,
  HeadConfig,
  TransformProps,
  TemplateConfig,
  TemplateRenderProps,
} from "@yext/pages";
import Favicon from "../public/yext-favicon.ico";

export const config: TemplateConfig = {
  name: "static-example",
};

export const transformProps: TransformProps<TemplateRenderProps> = async (
  data
) => {
  return data;
};

export const getPath: GetPath<TemplateRenderProps> = () => {
  return `index.html`;
};

export const getHeadConfig: GetHeadConfig<TemplateRenderProps> = ({
  relativePrefixToRoot,
  path,
  document,
}): HeadConfig => {
  return {
    title: "Static Page Example",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1",
    tags: [
      {
        type: "meta",
        attributes: {
          name: "description",
          content: "Static page example meta description.",
        },
      },
      {
        type: "link",
        attributes: {
          rel: "stylesheet",
          type: "text/css",
          href: "https://crossly-previous-buzzard.pgsdemo.com/styles.css",
        },
      },
    ],
  };
};

const Static: Template<TemplateRenderProps> = ({
  relativePrefixToRoot,
  path,
  document,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://crossly-previous-buzzard.pgsdemo.com/reviews-widget.js";
    script.async = true;

    script.onload = () => {
      if (typeof window.initWidget === "function" && containerRef.current) {
        window.initWidget({
          baseUrl: 'https://crossly-previous-buzzard.pgsdemo.com/',
          entityId: '8986600075955733488',
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div>
      <div className="review-carousel" ref={containerRef}>
        <button className="arrow-button" id="prev-button">&#8592;</button>
        <div id="review-carousel-container" className="review-carousel-container"></div>
        <button className="arrow-button" id="next-button">&#8594;</button>
      </div>
    </div>
  );
};

export default Static;
