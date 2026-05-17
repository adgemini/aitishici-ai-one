// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "AI one - Advanced AI Agent & Prompt Platform | Build, Share, and Multiply Productivity with One Click",
  // tagline: '方便中文使用 ChatGPT 快捷指令',
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
  },

  // Set the production url of your site here
  url: "https://www.onebiu.cn",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "rockbenben", // Usually your GitHub org/user name.
  projectName: "Chat-instructions", // Usually your repo name.

  onBrokenLinks: "throw",

  // Build-time injected fields (via webpack DefinePlugin under the hood)
  // buildDate 用于 schema.org Article 的 datePublished / dateModified
  customFields: {
    buildDate: new Date().toISOString(),
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is English, you
  // may want to replace "zh-Hans" with "en". "zh-Hant" hidden to avoid build save
  i18n: {
    defaultLocale: "zh-Hans",
    locales: ["zh-Hans"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "docs",
          sidebarPath: "sidebars.js",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  plugins: [
    /*
    [
      "@docusaurus/plugin-client-redirects",
      {
        redirects: [
          // /docs/oldDoc -> /docs/newDoc
          {
            to: "/",
            from: "/cn",
          },
        ],
      },
    ], */
  ],

  headTags: [],
  scripts: [],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/logo.png",
      // 全局 meta 标签（Docusaurus 默认不加 og:site_name，Facebook/LinkedIn 分享卡片需要）
      metadata: [{ property: "og:site_name", content: "AI one" }],
      // autocorrect: false,
      colorMode: {
        defaultMode: "dark",
        disableSwitch: false,
        respectPrefersColorScheme: false,
      },
      navbar: {
        hideOnScroll: true,
        title: "AI one",
        logo: {
          alt: "Chat instructions",
          src: "img/logo.png",
          width: 32,
          height: 32,
        },
        items: [
          {
            to: "/community-prompts",
            label: "社区提示词",
            position: "left",
          },
          {
            to: "docs",
            label: "使用说明",
            position: "left",
          },
          {
            type: "dropdown",
            label: "应用工具",
            position: "left",
            items: [
              {
                label: "ToolsByAI",
                href: "https://tools.newzone.top/",
              },
              {
                label: "LegendTalk",
                href: "https://talk.newzone.top/",
              },
              {
                label: "IMGPrompt",
                href: "https://prompt.newzone.top/app",
              },
              { type: "html", value: '<hr style="margin: 4px 0;">' },
              {
                label: "工具收藏",
                href: "https://nav.newzone.top",
              },
              {
                label: "Find on Product Hunt",
                href: "https://www.producthunt.com/posts/chatgpt-shortcut?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-chatgpt&#0045;shortcut",
              },
            ],
          },
          {
            to: "/feedback",
            label: "反馈建议",
            position: "left",
          },
        ],
      },
      footer: {
        copyright: `Copyright © ${new Date().getFullYear()} AI one (Chat instructions) · 用户内容仅代表作者本人`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
