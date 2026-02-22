# 推送到 GitHub：https://github.com/Xuluyan741/music

## 1. 生成 Token（若还没有）

1. 打开：https://github.com/settings/tokens  
2. **Generate new token** → **Generate new token (classic)**  
3. Note 填 `push`，Expiration 选 90 天，勾选 **repo**  
4. 点 **Generate token**，**复制**整串（形如 `ghp_xxxxxxxxxxxx`），保存备用。

## 2. 在终端执行（把 `你的Token` 换成你复制的 Token，整行粘贴）

```bash
cd /Users/xuluyan/netease-style-app
git remote set-url origin https://github.com/Xuluyan741/music.git
git push https://Xuluyan741:你的Token@github.com/Xuluyan741/music.git main
```

## 3. 推送成功后

以后可直接 `git push`（若提示密码，粘贴的也是 Token）：

```bash
git push -u origin main
```
