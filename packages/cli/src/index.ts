#!/usr/bin/env node

import { config } from 'dotenv';
import { program, Option } from 'commander';

import { Application } from './app.js';
import { Opts } from './types.js';

config();
const app = new Application();

program
  .command('login')
  .description('Logs you into the Spotify Web Api.')
  .action(() => app.login());

program
  .command('create <name>')
  .description('Creates a new podcast flow with a given name')
  .addOption(
    new Option(
      '-s, --showIds <showIds...>',
      "List of Spotify's URIs of the shows this flow should be subscribed to",
    ).makeOptionMandatory(),
  )
  .addOption(
    new Option('-t, --interval <interval>', 'Choose between "daily", "weekly" or "monthly"')
      .choices(['daily', 'weekly', 'monthly'])
      .makeOptionMandatory(),
  )
  .action((name: string, opts: Opts) => app.createFlow(name, opts));

program
  .command('delete <id>')
  .description(
    'Removes a podcast flow\n' +
      'This will only remove the functionality of refreshing your playlist with the content of the shows\n' +
      'you selected but you can still recover the playlist by visiting https://www.spotify.com/se/account/recover-playlists/',
  )
  .action((flowId: string) => app.deleteFlow(flowId));

program
  .command('renew <id>')
  .description('Renews the content of a podcast flow')
  .action((flowId: string) => app.renew(flowId));

program
  .command('renew-all')
  .description('Renews the content of all the flows for the current user')
  .action((flowId: string) => app.renewAll());

program.parse();
