import { App } from '../utils/slack';
import { faq } from '../constants/faq';
import { formatMessage } from '../utils/format';
import axios from 'axios';
import { SLACK_BOT_OAUTH_TOKEN } from '../utils/env';

const initCommands = (app: App) => {
  app.command('/ask', async ({ command, ack, say }) => {
    try {
      await ack();

      // ask expert
      if (command.text.includes('|') && command.text.includes('@')) {
        const args = command.text.split('|').map((arg) => arg.trim());
        const [name, question] = args;

        if (question === '') {
          say('please input your question');
          return;
        }

        const expertNames = name
          ?.split('@')
          .filter((n) => n !== '')
          .map((n) => n.trim());

        if (expertNames.length !== 0) {
          const userIds = await findUserIdsByNames(expertNames);

          // store data into database and get questionId
          const questionId = 10;

          userIds?.forEach((userId) => {
            publishMessage(userId as string, `QuestionId:${questionId} "${question}"`);
          });
          return;
        }
        return;
      }

      if (command.text.includes('@') && command.text.length < 20) {
        say('please update your question with more than 20 characters ');
        return;
      }

      // ask bot
      const url = `https://api.stackexchange.com/search/advanced?site=stackoverflow.com&&sort=relevance&order=desc&q=${command.text.trim()}`;

      axios.get(url).then((res) => {
        const searchResults = res.data.items;
        if (searchResults.length === 0) {
          say(`No search result found for "${command.text}". Please update your search text and search it again`);
          return;
        }

        say(`Your question:${command.text.trim()}\nWe find the following resources related to your question:`);

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

  // Find conversation ID using the conversations.list method
  async function findConversation(name: string) {
    try {
      // Call the conversations.list method using the built-in WebClient
      const result = await app.client.conversations.list({
        // The token you used to initialize your app
        token: SLACK_BOT_OAUTH_TOKEN,
      });

      if (result !== undefined) {
        for (const channel of (result as any).channels) {
          if (channel.name === name) {
            const conversationId = channel.id;

            // Print result
            console.log('Found conversation ID: ' + conversationId);
            // Break from for loop
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Post a message to a channel your app is in using ID and message text
  async function publishMessage(id: string, text: string) {
    try {
      const result = await app.client.chat.postMessage({
        token: SLACK_BOT_OAUTH_TOKEN,
        channel: id,
        text: text,
        // You could also use a blocks[] array to send richer content
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function findAllUsers() {
    try {
      const result = await app.client.users.list({
        token: SLACK_BOT_OAUTH_TOKEN,
      });

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }

  async function findUserIdsByNames(names: string[]): Promise<string[] | undefined> {
    try {
      const result = await app.client.users.list({
        token: SLACK_BOT_OAUTH_TOKEN,
      });

      let memberIds = [];
      let mapNames = new Map();
      names.forEach((n) => {
        mapNames.set(n, 1);
      });

      console.log(mapNames);

      if (result !== undefined) {
        for (const member of (result as any).members) {
          if (mapNames.has(member.name)) {
            console.log('hass member', member.name);
            memberIds.push(member.id);
          }
        }
      }
      console.log('ids', memberIds);

      return memberIds;
    } catch (error) {
      console.error(error);
    }
  }
};

export { initCommands };
