# AI Daily Digest 📬

每天自动发送 AI 领域资讯邮件，中英双语，完全免费，无需服务器。

## 效果

每天美东时间 12:00，一封中英双语 AI 日报自动发送到你的 Gmail，内容包括：

- **25 位顶级 AI Builder 的最新动态**（Andrej Karpathy、Sam Altman、Swyx、Alex Albert 等）
- **5 个头部 AI 播客摘要**（Latent Space、No Priors、Training Data 等）

## 原理

```
zarazhangrui/follow-builders（公开数据源）
        ↓ 每天 UTC 6:00 自动更新
  feed-x.json + feed-podcasts.json
        ↓
  GitHub Actions 美东时间 12:00 触发
        ↓
  DeepSeek API 生成中英双语摘要
        ↓
  Gmail 发送到你的邮箱
```

数据源来自 [@zarazhangrui](https://github.com/zarazhangrui/follow-builders) 维护的公开项目，无需自己申请 X API 或 Supadata API。

## 使用方法

### 1. Fork 本仓库

### 2. 添加 3 个 Secrets

进入仓库 Settings → Secrets and variables → Actions：

| Secret 名称 | 说明 |
|---|---|
| `DEEPSEEK_API_KEY` | [DeepSeek 开放平台](https://platform.deepseek.com/) 申请 |
| `GMAIL_USER` | 你的 Gmail 地址 |
| `GMAIL_APP_PASSWORD` | Gmail → Google 账号 → 安全性 → 应用专用密码 |

### 3. 修改收件邮箱

编辑 `digest.js` 第 12 行，改成你自己的邮箱：

```js
const RECIPIENT = 'your@gmail.com';
```

### 4. 测试

Actions → AI Daily Digest → Run workflow，收到邮件即配置成功。

## 费用

| 服务 | 费用 |
|---|---|
| GitHub Actions | 免费（公开仓库无限制）|
| DeepSeek API | 极低，每封邮件约 ¥0.01 |
| Gmail SMTP | 免费 |

## Credits

数据源由 [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders) 提供和维护。
