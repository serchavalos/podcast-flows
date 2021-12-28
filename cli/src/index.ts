#! /usr/bin/env node

import { config } from 'dotenv';
import { program, Option } from 'commander';

import { createAuthorizedInstance } from './lib/spotify-api-setup.js';
import { FlowController } from './lib/flows/controller.js';
import { Application } from './app.js';
import { Opts } from './types.js';

setImmediate(async () => {
  config();

  const spotifyWebApi = await createAuthorizedInstance();
  const flowController = new FlowController(spotifyWebApi);
  const app = new Application(flowController);

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
    .command('renew <id>')
    .description('Renews the content of a podcast flow')
    .action((flowId: string) => app.renewFlow(flowId));

  program
    .command('delete <id>')
    .description(
      'Removes a podcast flow\n' +
        'This will only remove the functionality of refreshing your playlist with the content of the shows\n' +
        'you selected but you can still recover the playlist by visiting https://www.spotify.com/se/account/recover-playlists/',
    )
    .action((flowId: string) => app.deleteFlow(flowId));

  program
    .command('run-scheduler')
    .description('Run the scheduler to update the flows according to their time intervals')
    .action(() => app.runScheduler());

  program.parse();
});
