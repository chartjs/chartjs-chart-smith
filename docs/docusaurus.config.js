// VERSION replaced by deploy script
module.exports = {
  title: 'chartjs-chart-smith',
  tagline: 'Smith chart extension to Chart.js',
  url: 'https://chartjs.org',
  baseUrl: '/chartjs-chart-smith/',
  favicon: 'img/favicon.ico',
  organizationName: 'chartjs', // Usually your GitHub org/user name.
  projectName: 'chartjs-chart-smith', // Usually your repo name.
  plugins: [],
  scripts: [
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0/dist/Chart.js',
    'https://cdn.jsdelivr.net/npm/chartjs-chart-smith/dist/chartjs-chart-smith.min.js'
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
  themeConfig: {
    disableDarkMode: true, // Would need to implement for Charts embedded in docs
    navbar: {
      title: 'Smith Chart - chartjs-chart-smith',
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Developers',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/chartjs/chartjs-chart-smith',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Chart.js contributors.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: '',
          editUrl: 'https://github.com/chartjs/chartjs-chart-smith/edit/master/docs/',
          sidebarPath: require.resolve('./sidebars.js'),
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};