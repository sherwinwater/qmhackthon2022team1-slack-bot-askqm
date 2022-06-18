import { app } from './utils/slack'
import { initMessages } from './events/messages'
import { initCommands } from './events/commands'
import { SLACK_APP_PORT } from './utils/env'
import { DB, initDB } from './db/db';

initDB();

initMessages(app)
initCommands(app)

app.start(SLACK_APP_PORT).then(() => {
  console.log(`⚡️ Slack Bolt app is running on port ${SLACK_APP_PORT}!`);
})
