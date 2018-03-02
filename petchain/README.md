# 百度“莱茨狗”助手

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
        proxy_set_header Host "pet-chain.baidu.com";
        proxy_pass https://pet-chain.baidu.com;
    }
}
```