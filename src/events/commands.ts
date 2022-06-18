import { App } from '../utils/slack';
import { faq } from '../constants/faq';
import { formatMessage } from '../utils/format';
import axios from 'axios';

const initCommands = (app: App) => {
  app.command('/knowledge', async ({ command, ack, say }) => {
    try {
      await ack();
      const args = command.text.split('|').map((arg) => arg.trim());
      const [keyword, question] = args;
      const foundFaq = faq.find((entry) => entry.keyword.includes(keyword) || entry.question.includes(question));
      if (foundFaq) {
        say({
          blocks: [
            formatMessage('Yaaay! Found a FAQ with that keyword or question!'),
            formatMessage('*Question ❓*'),
            formatMessage(foundFaq.question),
            formatMessage('*Answer ✔️*'),
            formatMessage(foundFaq.answer),
          ],
        });
      } else {
        say("Noo! Can't find a entry with that keyword!");
      }
    } catch (error) {
      console.log('err');
      console.error(error);
    }
  });

  app.command('/ask', async ({ command, ack, say }) => {
    try {
      await ack();

      const url = `https://api.stackexchange.com/search/advanced?site=stackoverflow.com&&sort=relevance&order=desc&q=${command.text.trim()}`;

      axios.get(url).then((res) => {
        const searchResults = res.data.items;
        if (searchResults.length === 0) {
          say(`No search result found for "${command.text}". Please update your search text and search it again`);
          return;
        }

        searchResults.slice(0, 10).forEach((item: any, index: number) => {
          say({
            blocks: [formatMessage(item.title), formatMessage(item.link)],
          });
        });
      });
    } catch (error) {
      console.log('err');
      console.error(error);
    }
  });
};

export { initCommands };
