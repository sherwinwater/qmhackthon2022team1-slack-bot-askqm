# hackathon-2022-slackbot

Adapted from https://blog.logrocket.com/build-a-slackbot-in-node-js-with-slacks-bolt-api/

## Required

1. [yarn](https://formulae.brew.sh/formula/yarn)

## Setup Workspace and Slack App

1. Clone this repo
2. Create a [new slack workspace](https://slack.com/create#email) for testing
3. Create a [new slack app](https://api.slack.com/apps/) > Create New App
  - Use manifest method
  - Upload the `./manifest.json` file in this repo
  - Select the workspace you made above
4. Install slack app to workspace
5. Populate `.env` file variables
  - `SLACK_BOT_OAUTH_TOKEN`
    - Left Nav > Features > OAuth & Permissions
    - Copy token from `OAuth Tokens for Your Workspace`
  - `SLACK_SIGNING_SECRET`
    - Left Nav > Settings > Basic Information
    - Copy token from `App Credentials Section`
  - `SLACK_APP_LEVEL_TOKEN`
    - Left Nav > Settings > Basic Information > Generate App Level Token:
      - Name: `SocketMode`
      - Add Scope: `connections:write` and `authorizations:read`
    - Copy token after token creation
6. Reinstall app if prompted

## Getting Started

1. `yarn install` dependencies
2. `yarn dev` run server

## Resources

- Hackathon Deck: https://docs.google.com/presentation/d/1zN3z90KPaRc94HFefvezWxCt0bEtOIWELsBEWTbp3GQ/edit?usp=sharing
- In Depth Guide: https://blog.logrocket.com/build-a-slackbot-in-node-js-with-slacks-bolt-api/
- Boilerplate Repo: https://github.com/QuantumMob/hackathon-2022-slackbot
- Slack api home: https://api.slack.com/apps/ 
- Slack bolt reference: https://slack.dev/bolt-js/concepts
