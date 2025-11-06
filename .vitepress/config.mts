import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "TV Box 源开发文档",
  description: "Flutter TV Box 视频源编写指南和 API 文档",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '源编写规则', link: '/source-rules' },
      { text: 'API 参考', link: '/api-reference' },
      { text: '订阅规则', link: '/subscription-rules' },
      { text: '常见问题', link: '/faq' }
    ],

    sidebar: [
      {
        text: '快速开始',
        items: [
          { text: '简介', link: '/' },
          { text: '快速开始', link: '/getting-started' },
          { text: '源编写规则', link: '/source-rules' }
        ]
      },
      {
        text: 'API 文档',
        items: [
          { text: 'API 参考', link: '/api-reference' }
        ]
      },
      {
        text: '订阅管理',
        items: [
          { text: '订阅规则', link: '/subscription-rules' }
        ]
      },
      {
        text: '帮助',
        items: [
          { text: '常见问题', link: '/faq' }
        ]
      }
    ],

    footer: {
      message: 'TV Box 源开发文档',
      copyright: 'Copyright © 2025'
    }
  }
})
