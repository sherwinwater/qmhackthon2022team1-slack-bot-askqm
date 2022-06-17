import { App } from '../utils/slack';

const initMessages = (app: App) => {

  app.message(/hey/, async ({ say }) => {
    try {
      say("Yaaay! that command works!");
    } catch (error) {
      console.log("err")
      console.error(error);
    }
  });

}

export { initMessages }
