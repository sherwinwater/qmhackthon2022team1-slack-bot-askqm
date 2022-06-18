import { config } from 'dotenv'

// read env vars
config()
const SLACK_APP_PORT = Number(process.env.SLACK_APP_PORT ?? 0);
const SLACK_BOT_OAUTH_TOKEN = String(process.env.SLACK_BOT_OAUTH_TOKEN ?? 'invalid');
const SLACK_USER_OAUTH_TOKEN = String(process.env.SLACK_USER_OAUTH_TOKEN ?? 'invalid');
const SLACK_SIGNING_SECRET = String(process.env.SLACK_SIGNING_SECRET ?? 'invalid');
const SLACK_APP_LEVEL_TOKEN = String(process.env.SLACK_APP_LEVEL_TOKEN ?? 'invalid');
const SUFFIX = String(process.env.SUFFIX ?? '');

export {
  SLACK_APP_PORT,
  SLACK_BOT_OAUTH_TOKEN,
  SLACK_SIGNING_SECRET,
  SLACK_APP_LEVEL_TOKEN,
  SLACK_USER_OAUTH_TOKEN,
  SUFFIX
}