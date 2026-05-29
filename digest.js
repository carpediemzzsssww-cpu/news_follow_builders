#!/usr/bin/env node
'use strict';

try { require('dotenv').config({ path: __dirname + '/.env' }); } catch (_) {}

const https = require('https');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
});

const RECIPIENT = 'carpediemzzsssww@gmail.com';
const FEED_X_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-x.json';
const FEED_PODCASTS_URL = 'https://raw.githubusercontent.com/zarazhangrui/follow-builders/main/feed-podcasts.json';

// ─── Fetch ────────────────────────────────────────────────────────────────────

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'AI-Digest/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

// ─── Digest Generation ────────────────────────────────────────────────────────

function buildPrompt(feedX, feedPodcasts) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/New_York',
  });

  const tweetsSection = feedX.x.map(builder => {
    const tweets = builder.tweets
      .map(t => `  - "${t.text}" (${t.likes}❤️ ${t.retweets}🔁)\n    ${t.url}`)
      .join('\n');
    return `**${builder.name}** (@${builder.handle})\n${tweets}`;
  }).join('\n\n');

  const podcastsSection = feedPodcasts.podcasts.length > 0
    ? feedPodcasts.podcasts.map(ep => {
        const excerpt = ep.transcript ? ep.transcript.slice(0, 4000) + '...' : 'No transcript.';
        return `**${ep.name}** — "${ep.title}"\nURL: ${ep.url}\nTranscript excerpt:\n${excerpt}`;
      }).join('\n\n---\n\n')
    : 'No new episodes in the last 72 hours.';

  return `Today is ${today}. Create a daily digest for an AI practitioner.

## CRITICAL OUTPUT FORMAT — BILINGUAL (中英双语)

Every section MUST contain BOTH English and Chinese. After each English paragraph, immediately write the Chinese translation. Do NOT write a full English block followed by a full Chinese block — interleave them paragraph by paragraph.

Example of correct format:

### Today's Highlights
The big theme today is the maturation of agent infrastructure...
今天的核心主题是 agent 基础设施的成熟化……

### Builder Updates
**Sam Altman** (@sama): Announced the rollout of GPT-5.5...
**Sam Altman** (@sama)：宣布 GPT-5.5 向关键网络防御者推出……

If any section is missing the Chinese translation, the output is INVALID. This is the most important rule.

---

## TWEETS FROM AI BUILDERS (last 24 hours)
${tweetsSection}

## RECENT PODCAST EPISODES (last 72 hours)
${podcastsSection}

---

Structure the digest with these four sections (each in 中英双语 as shown above):

### Today's Highlights / 今日重点
3-4 sentences on the most important themes.

### Builder Updates / Builder 动态
For each builder with substantive content (skip trivial tweets), write 2-3 sentences capturing their key insight. Include a direct quote where impactful. Skip builders with no meaningful content.

### Podcast Recap / 播客回顾
For each episode: topic, 3-4 key insights, main takeaway.

### Key Takeaways / 核心要点
3-5 bullet points of the most actionable things to know today.

Be concise and direct. Total ~800-1200 words combined (EN + ZH). Format in clean Markdown.`;
}

async function generateDigest(feedX, feedPodcasts) {
  const response = await client.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: 'You are a bilingual AI news curator. You ALWAYS produce bilingual output: every paragraph in English is immediately followed by its Chinese translation. Output that contains only English (or only Chinese) is invalid and unacceptable. 你必须输出中英双语，每段英文后紧跟中文翻译。',
      },
      { role: 'user', content: buildPrompt(feedX, feedPodcasts) },
    ],
    max_tokens: 4096,
    temperature: 0.5,
  });
  return response.choices[0].message.content;
}

// ─── Email Formatting ─────────────────────────────────────────────────────────

function markdownToHTML(md) {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '</p><h3>$1</h3><p>')
    .replace(/^## (.+)$/gm, '</p><h2>$1</h2><p>')
    .replace(/^# (.+)$/gm, '</p><h1>$1</h1><p>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/<ul><\/p><p>/g, '<ul>')
    .replace(/<\/li><\/ul><p>/g, '</li></ul><p>');
}

function buildEmailHTML(digestMarkdown, feedX, feedPodcasts) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/New_York',
  });

  const tweetLinks = feedX.x.flatMap(b =>
    b.tweets.map(t => {
      const preview = t.text.length > 90 ? t.text.slice(0, 90) + '…' : t.text;
      return `<li><a href="${t.url}">[${b.name}] ${preview}</a></li>`;
    })
  ).join('');

  const podcastLinks = feedPodcasts.podcasts.map(ep =>
    `<li><a href="${ep.url}">[${ep.name}] ${ep.title}</a></li>`
  ).join('');

  const bodyHTML = `<p>${markdownToHTML(digestMarkdown)}</p>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px 16px; }
  .wrap { max-width: 660px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); border-radius: 12px 12px 0 0; padding: 32px 40px; color: #fff; }
  .header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
  .header .meta { margin-top: 6px; font-size: 13px; opacity: 0.7; }
  .body { background: #fff; padding: 32px 40px; line-height: 1.75; color: #1a1a2e; }
  .body h2 { color: #302b63; font-size: 18px; margin: 28px 0 10px; border-left: 4px solid #302b63; padding-left: 12px; }
  .body h3 { color: #1a1a2e; font-size: 16px; margin: 20px 0 6px; }
  .body p { margin: 10px 0; }
  .body ul { padding-left: 20px; margin: 8px 0; }
  .body li { margin: 5px 0; }
  .body strong { color: #0f0c29; }
  .body a { color: #302b63; }
  .body code { background: #f4f4f8; padding: 1px 5px; border-radius: 4px; font-size: 13px; }
  .sources { background: #f8f9fc; border-radius: 0 0 12px 12px; padding: 24px 40px; border-top: 1px solid #e8eaf0; }
  .sources h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; margin-bottom: 12px; }
  .sources ul { list-style: none; padding: 0; }
  .sources li { margin: 4px 0; }
  .sources a { color: #302b63; text-decoration: none; font-size: 13px; }
  .sources a:hover { text-decoration: underline; }
  .footer { text-align: center; font-size: 12px; color: #aaa; margin-top: 16px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🤖 AI Daily Digest</h1>
    <div class="meta">${today} &nbsp;·&nbsp; ${feedX.stats.totalTweets} tweets from ${feedX.stats.xBuilders} builders &nbsp;·&nbsp; ${feedPodcasts.stats.podcastEpisodes} podcast episode(s)</div>
  </div>
  <div class="body">
    ${bodyHTML}
  </div>
  ${(tweetLinks || podcastLinks) ? `
  <div class="sources">
    <h3>Source Links</h3>
    ${tweetLinks ? `<ul>${tweetLinks}</ul>` : ''}
    ${podcastLinks ? `<ul>${podcastLinks}</ul>` : ''}
  </div>` : ''}
  <div class="footer">
    Auto-generated · Powered by DeepSeek · Data: <a href="https://github.com/zarazhangrui/follow-builders">follow-builders</a> by @zarazhangrui
  </div>
</div>
</body>
</html>`;
}

// ─── Send Email ───────────────────────────────────────────────────────────────

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

async function sendEmail(transporter, subject, html) {
  await transporter.sendMail({
    from: `AI Digest <${process.env.GMAIL_USER}>`,
    to: RECIPIENT,
    subject,
    html,
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function requireEnv() {
  const missing = ['DEEPSEEK_API_KEY', 'GMAIL_USER', 'GMAIL_APP_PASSWORD']
    .filter(k => !process.env[k] || !process.env[k].trim());
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting AI digest...`);

  requireEnv();

  const [feedX, feedPodcasts] = await Promise.all([
    fetchJSON(FEED_X_URL),
    fetchJSON(FEED_PODCASTS_URL),
  ]);
  console.log(`Fetched: ${feedX.stats.totalTweets} tweets, ${feedPodcasts.stats.podcastEpisodes} podcast episode(s)`);

  if (feedX.x.length === 0 && feedPodcasts.podcasts.length === 0) {
    console.log('No content today, skipping.');
    return;
  }

  // Verify email credentials BEFORE the (paid) DeepSeek call, so bad creds fail fast.
  const transporter = createTransporter();
  console.log('Verifying email credentials...');
  await transporter.verify();

  console.log('Generating digest with DeepSeek...');
  const digestMarkdown = await generateDigest(feedX, feedPodcasts);

  const html = buildEmailHTML(digestMarkdown, feedX, feedPodcasts);

  const dateLabel = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York',
  });

  console.log('Sending email...');
  await sendEmail(transporter, `AI Daily Digest — ${dateLabel}`, html);
  console.log(`✓ Digest sent to ${RECIPIENT}`);
}

main().catch(err => {
  console.error('✗ Error:', err.message);
  if (/535|BadCredentials|Invalid login/i.test(err.message || '')) {
    console.error('→ Gmail 应用密码被拒。去 https://myaccount.google.com/apppasswords 重生，并更新 GMAIL_APP_PASSWORD Secret。');
  }
  process.exit(1);
});
