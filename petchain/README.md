# 百度“莱茨狗”助手

### 常见问题

> 如何登录

1.打开百度莱茨狗首页（https://pet-chain.baidu.com）

2.开发者模式（以Chrome浏览器为例）

![Chrome](https://github.com/kyai/pictures/blob/master/20180321215739.png?raw=true)

### 服务器搭建

> Nginx配置

```
server {
    listen       80;
    server_name  petchain.com;

    root   /home/petchain;

    location / {
        index  index.html;
    }

    location /data/ {
        proxy_pass https://pet-chain.baidu.com;
        proxy_set_header Host "pet-chain.baidu.com";
    }
}
```