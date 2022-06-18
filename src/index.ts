import { app } from './utils/slack'
import { initMessages } from './events/messages'
import { initCommands } from './events/commands'
import { SLACK_APP_PORT } from './utils/env'
import { DB, initDB } from './db/db';

initDB();

setTimeout(() => {
  DB.addQuestion('flutterflow' + new Date().toISOString(), () => {
    console.log('question added');
    DB.getAll('QUESTIONS')
      .then(console.log)
  });
  DB.addAnswer('flutterflow' + new Date().toISOString(), 'ben', () => {
    console.log('answer added');
    DB.getAll('ANSWERS')
      .then(console.log)
  });
}, 2000);

initMessages(app)
initCommands(app)

app.start(SLACK_APP_PORT).then(() => {
  console.log(`⚡️ Slack Bolt app is running on port ${SLACK_APP_PORT}!`);
})
