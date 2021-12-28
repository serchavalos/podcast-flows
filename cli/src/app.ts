import cron from 'node-cron';

import { FlowController } from './lib/flows/controller';
import { Flow } from './lib/flows/types';
import { blue, green, red, yellow } from './lib/log.js';
import { sleepFor } from './lib/utils.js';
import { Opts } from './types.js';

export class Application {
  constructor(private flowController: FlowController) {}

  async createFlow(flowName: string, { showIds, interval }: Opts): Promise<void> {
    try {
      const flowId = await this.flowController.createFlow(flowName, showIds, interval);
      green(
        `Contragulations!\nYour flow has been succesfully created.\nCheck it out by visiting https://open.spotify.com/playlist/${flowId}`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps.... Something went wrong: ${err}`);
      process.exit(1);
    }
  }

  async deleteFlow(flowId: string): Promise<void> {
    try {
      await this.flowController.delete(flowId);
      green(
        `The flow ID ${flowId} has been deleted.\nYou can still recover the playlist at https://www.spotify.com/se/account/recover-playlists/`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps.... Something went wrong: ${err}.`);
      process.exit(1);
    }
  }

  async renewFlow(flowId: string): Promise<void> {
    try {
      await this.flowController.renew(flowId);
      green(
        `The flow ID ${flowId} has been renewed.\nCheck it out by visiting https://open.spotify.com/playlist/${flowId}`,
      );
      process.exit(0);
    } catch (err) {
      red(`Oppps.... Something went wrong: ${err}.`);
      process.exit(1);
    }
  }

  runScheduler(): void {
    const flows = this.flowController.getAllFlows();
    if (!flows.length) {
      yellow('No flows have been registered yet');
      process.exit(0);
    }

    blue('Scheduler has been started');

    cron.schedule('0 4 * * *', async () => {
      const currentDate = new Date();
      blue(`Staring renewal on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}`);

      for (let index = 0, flow: Flow; index < flows.length; index++) {
        flow = flows[index];
        const flowId = flow.playlistId;
        const flowName = flow.name;

        try {
          blue(`Renew flow ${flowId} called "${flowName}"...`);
          await this.flowController.renew(flowId);
          green('...completed!');
        } catch (err) {
          red(`... dang, something went wrong: ${err}`);
        }
      }

      sleepFor(10); // Avoid spamming Spotify's Web API
    });
  }
}
