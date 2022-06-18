import { App } from '../utils/slack';
import { formatMessage } from '../utils/format';
import axios from 'axios';
import { SLACK_BOT_OAUTH_TOKEN, SLACK_USER_OAUTH_TOKEN } from '../utils/env';
import { DB } from '../db/db';

const initCommands = (app: App) => {
  app.command('/answer', async ({ command, ack, say }) => {
    try {
      await ack();
      if (!command.text.includes('|')) {
        say('Please follow the format: `questionNumberId | content`');
        return;
      }
      const tokens = command.text.split('|');
      const questionId = Number(tokens[0]);
      const content = tokens[1];
      let question;
      try {
        question = await DB.getEntry('QUESTIONS', questionId);
      } catch (e) {
        console.log('Exception DB.getEntry(\'QUESTIONS\')', e);
      }
      if (!question) {
        say('Wrong question id.');
        return;
      }
      const answerAuthorId = await findUserId();
      const answerAuthor = await findUserNameById(answerAuthorId as string);
      const dbUser: any = await DB.findPlayerByUserId(answerAuthorId as string);

      let userId;
      if (!dbUser) {
        const response: any = await DB.addPlayer(answerAuthorId as string, answerAuthor?.name as string);
        userId = response.id;
      } else {
        userId = dbUser.id;
      }
      try {
        await DB.addAnswer(content, question.id, userId);
        say('Thanks for you answer');
      } catch (e) {
        console.log('Exception DB.addAnswer', e);
      }
    } catch (error) {
      console.log('Exception /answer', error);
    }
  });
  app.command('/db', async ({ command, ack, say }) => {
    await ack();
    let answers = await DB.getAll('ANSWERS');
    say(JSON.stringify(answers, null, 2));
    let questions = await DB.getAll('QUESTIONS');
    say(JSON.stringify(questions, null, 2));
    let players = await DB.getAll('PLAYERS');
    say(JSON.stringify(players, null, 2));
  });

  app.command('/ask', async ({ command, ack, say }) => {
    try {
      await ack();
      findUserId();

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
          const expertIds = await findUserIdsByNames(expertNames);
          const questionAuthorId = await findUserId();
          const questionAuthor = await findUserNameById(questionAuthorId as string);
          console.log('author,', questionAuthor);

          // store data into database and get questionId
          // insert: player (userId, userName)
          // data: question ( title, authorId, created_at, answerId, status)

          const dbUser: any = await DB.findPlayerByUserId(questionAuthorId as string);

          let userId;
          if (!dbUser) {
            const response: any = await DB.addPlayer(questionAuthorId as string, questionAuthor?.name as string);

            userId = response.id;
          } else {
            userId = dbUser.id;
          }
          console.log('userid', userId);

          const questionResponse: any = await DB.addQuestion(question, 'Open', userId, null);
          const questionId = questionResponse.id;

          expertIds?.forEach((user) => {
            publishMessage(user.id as string, `QuestionId: ${questionId}\nQuestion: ${question}\nExpert: ${user.name}`);
          });

          say('your question has been sent to the expert(s)');
          return;
        }

        say('No expert found for your question');
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

  async function findUserIdsByNames(names: string[]): Promise<{ id: string; name: string }[] | undefined> {
    try {
      const result = await app.client.users.list({
        token: SLACK_BOT_OAUTH_TOKEN,
      });

      let members: { id: string; name: string }[] = [];
      let mapNames = new Map();
      names.forEach((n) => {
        mapNames.set(n, 1);
      });

      if (result !== undefined) {
        for (const member of (result as any).members) {
          if (mapNames.has(member.name)) {
            members.push({ id: member.id, name: member.real_name });
          }
        }
      }

      return members;
    } catch (error) {
      console.error(error);
    }
  }

  async function findUserNameById(id: string): Promise<{ id: string; name: string } | undefined> {
    try {
      const result = await app.client.users.list({
        token: SLACK_BOT_OAUTH_TOKEN,
      });

      let user: { id: string; name: string } = { id: '', name: '' };

      if (result !== undefined) {
        for (const member of (result as any).members) {
          if (member.id === id) {
            user.id = member.id;
            user.name = member.real_name;
          }
        }
      }

      return user;
    } catch (error) {
      console.error(error);
    }
  }

  async function findUserId(): Promise<string | undefined> {
    try {
      const result = await app.client.auth.test({
        token: SLACK_USER_OAUTH_TOKEN,
      });

      return result.user_id;
    } catch (error) {
      console.error(error);
    }
  }
};

export { initCommands };
