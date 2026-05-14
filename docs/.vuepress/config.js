import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  base: '/DOV-Calc/',
  lang: 'zh-CN',
  title: 'DOV计算器 - 拂晓胜利之刻计算器工具集',
  description: '面向拂晓：胜利之刻玩家的计算器、资料整理和攻略笔记工具站',
  bundler: viteBundler(),
  theme: defaultTheme({
    logo: null,
    navbar: [
      { text: '首页', link: '/' },
      { text: '计算器', link: '/tools/' },
      { text: '攻略笔记', link: '/posts/' },
    ],
    sidebar: {
      '/': [],
      '/tools/': [
        {
          text: '计算器工具',
          children: [
            '/tools/',
            {
              text: '伤害计算器',
              link: '/tools/dov-basic.md',
            },
          ],
        },
      ],
      '/posts/': [
        {
          text: '攻略笔记',
          children: [
            '/posts/',
            '/posts/getting-started.md',
          ],
        },
      ],
    },
    lastUpdated: true,
    contributors: false,
    editLink: false,
  }),
})
