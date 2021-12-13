#! /usr/bin/env node

import { config } from 'dotenv';
import { program, Option } from 'commander';

import { createNewFlow } from './commands/index.js';

config();

const showUrisOption = new Option(
  '-s, --shows <showUris...>',
  "List of Spotify's URIs of the shows this flow should be subscribed to",
).makeOptionMandatory();
const intervalOption = new Option('-t, --interval <interval>', 'Choose between "daily",  "weekly" or "monthly"')
  .choices(['daily', 'weekly', 'monthly'])
  .makeOptionMandatory();

program
  .command('create <name>')
  .description('Creates a new podcast flow with a given name')
  .addOption(showUrisOption)
  .addOption(intervalOption)
  .action(createNewFlow);
/*
program
  .command("add-shows <id>")
  .description("Adds new a given list shows to a podcast flow")
  .addOption(showUrisOption)
  .action(addFlow);

program
  .command("remove-shows <id>")
  .description("Removes a give list of shows to a podcast flow")
  .addOption(showUrisOption)
  .action(removeFlow);

program
  .command("set-interval <id>")
  .description("Set a new time interval for renewing the flow.")
  .addOption(intervalOption)
  .action(setInterval);

program
  .command("list-shows <id>")
  .description("List the shows that a podcast flow is subscribed to")
  .action(listFlow);

program
  .command("delete <id>")
  .description(
    "Removes a podcast flow\nWARNING: This will remove *PERMANENTLY* the playlist from your library"
  )
  .action(deleteFlow);
*/
program.parse();
