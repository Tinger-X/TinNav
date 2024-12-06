# TinNav
使用Cloudflare Workers(KV)+Pages搭建的浏览器导航页

# 说明
项目开发中，尚未完工。

# 部署
## Workers
1. 在Cloudflare中新建KV存储空间
2. 将`worker.js`中代码复制到新建的Cloudflare Worker中，修改相关配置
3. 绑定自定域名`nav-api.<your-domain.com>`到该worker

## Pages
1. fork该项目到自己的github仓库
2. 