import { App } from '../utils/slack';
import { faq } from '../constants/faq'
import { formatMessage } from '../utils/format';

const initCommands = (app: App) => {

  app.command("/knowledge", async ({ command, ack, say }) => {
    try {
      await ack();
      const args = command.text.split('|').map((arg) => arg.trim());
      const [keyword, question] = args;
      const foundFaq = faq.find((entry) => {
        entry.keyword.includes(keyword) || entry.question.includes(question)
      })
      if (foundFaq) {
        say({ 
          blocks: [
            formatMessage("Yaaay! Found a FAQ with that keyword or question!"),
            formatMessage('*Question ❓*'),
            formatMessage(foundFaq.question),
            formatMessage('*Answer ✔️*'),
            formatMessage(foundFaq.answer),
          ]
        })
      } else {
        say("Noo! Can't find a entry with that keyword!");
      }
    } catch (error) {
      console.log("err")
      console.error(error);
    }
  });

}

export { initCommands }
