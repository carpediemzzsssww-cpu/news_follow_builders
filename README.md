# AI Daily Digest 📬

每天自动发送 AI 领域资讯邮件，中英双语，完全免费，无需服务器。

*Automated daily AI news digest delivered to your Gmail — bilingual, free, no server needed.*

---

## 效果 / What You Get

每天美东时间 12:00，一封中英双语 AI 日报自动发送到你的 Gmail，内容包括：

*Every day at 12:00 PM Eastern, a bilingual AI digest lands in your Gmail, covering:*

- **25 位顶级 AI Builder 的最新动态** / **Latest from 25 top AI builders**（Andrej Karpathy、Sam Altman、Swyx、Alex Albert 等）
- **5 个头部 AI 播客摘要** / **5 leading AI podcast recaps**（Latent Space、No Priors、Training Data 等）

---

## 原理 / How It Works

```
zarazhangrui/follow-builders（公开数据源 / public data source）
        ↓ 每天 UTC 6:00 自动更新 / auto-updated daily at UTC 6:00
  feed-x.json + feed-podcasts.json
        ↓
  GitHub Actions 美东时间 12:00 触发 / triggered at 12:00 PM Eastern
        ↓
  DeepSeek API 生成中英双语摘要 / generates bilingual summary
        ↓
  Gmail 发送到你的邮箱 / delivers to your inbox
```

数据源来自 [@zarazhangrui](https://github.com/zarazhangrui/follow-builders) 维护的公开项目，无需自己申请 X API 或 Supadata API。

*Data is sourced from the public project maintained by [@zarazhangrui](https://github.com/zarazhangrui/follow-builders) — no X API or Supadata API key required.*

---

## 使用方法 / Setup

### 1. Fork 本仓库 / Fork this repo

### 2. 添加 3 个 Secrets / Add 3 Secrets

进入仓库 Settings → Secrets and variables → Actions：

*Go to your repo Settings → Secrets and variables → Actions:*

| Secret 名称 / Name | 说明 / Description |
|---|---|
| `DEEPSEEK_API_KEY` | [DeepSeek 开放平台](https://platform.deepseek.com/) 申请 / Get from DeepSeek platform |
| `GMAIL_USER` | 你的 Gmail 地址 / Your Gmail address |
| `GMAIL_APP_PASSWORD` | Gmail 应用专用密码 / Gmail App Password |

> Gmail App Password 获取方式：Google 账号 → 安全性 → 两步验证 → 应用专用密码
>
> *To get Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords*

### 3. 修改收件邮箱 / Set recipient email

编辑 `digest.js` 第 12 行 / Edit line 12 in `digest.js`:

```js
const RECIPIENT = 'your@gmail.com';
```

### 4. 测试 / Test

Actions → AI Daily Digest → Run workflow

收到邮件即配置成功。/ If you receive the email, setup is complete.

---

## 费用 / Cost

| 服务 / Service | 费用 / Cost |
|---|---|
| GitHub Actions | 免费 / Free（公开仓库无限制 / unlimited for public repos）|
| DeepSeek API | 极低，每封约 ¥0.01 / ~¥0.01 per email |
| Gmail SMTP | 免费 / Free |

---

## Credits

数据源由 [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders) 提供和维护。

*Data sourced and maintained by [zarazhangrui/follow-builders](https://github.com/zarazhangrui/follow-builders).*
