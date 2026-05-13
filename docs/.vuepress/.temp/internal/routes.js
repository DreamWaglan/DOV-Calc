export const redirects = JSON.parse("{}")

export const routes = Object.fromEntries([
  ["/", { loader: () => import(/* webpackChunkName: "index.html" */"D:/Projects/DOV-Calculator/docs/README.md"), meta: {"title":"Hello VuePress"} }],
  ["/404.html", { loader: () => import(/* webpackChunkName: "404.html" */"D:/Projects/DOV-Calculator/docs/.vuepress/.temp/pages/404.html.vue"), meta: {"title":""} }],
]);
