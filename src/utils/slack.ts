import { App } from '@slack/bolt';
import { SLACK_BOT_OAUTH_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_LEVEL_TOKEN, } from './env';

// start slack connection
const app = new App({
  token: SLACK_BOT_OAUTH_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET,
  // appToken: SLACK_APP_LEVEL_TOKEN, // needed for socketMode: true
  // socketMode: true,
});

export { app, App }