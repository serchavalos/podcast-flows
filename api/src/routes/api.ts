import { Router, Request, Response, NextFunction } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { PodcastFlowController } from "../lib/podcast-flows/controller";

import { getBearerPassportMiddleware } from "../middlewares/bearer-passport";
import { initDatabase, PodcastFlow } from "../storage";

declare global {
  // TODO: Figure out how to move this to `tsconfig.json`
  // So far, `ts-node-dev` is not picking up this override
  namespace Express {
    interface User {
      username: string;
      accessToken: string;
    }
  }
}

type PodcastFlowRequest = Request<{}, {}, PodcastFlow>;
type PodcastFlowResponse = Response<{}, { controller: PodcastFlowController }>;

const router = Router();
router.use(getBearerPassportMiddleware());
router.use((req: Request, res: Response, next: NextFunction) => {
  const db = initDatabase();
  const { username, accessToken } = req.user;
  const api = new SpotifyWebApi();
  api.setAccessToken(accessToken);

  res.locals.controller = new PodcastFlowController(username, api, db);
  next();
});

router.post(
  "/podcast-flows/",
  async (req: PodcastFlowRequest, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const { name, showIds = [], interval } = req.body;
      const flowId = await controller.addNew(name, showIds, interval);
      return res.json({ flowId });
    } catch (err) {
      if (!err.statusCode) {
        return res.json({
          error: {
            status: 400,
            message: err.message,
          },
        });
      }
      return res.json({
        error: {
          status: err.statusCode,
          message: err.body.error.message,
        },
      });
    }
  }
);

router.get(
  "/podcast-flows/:id",
  async (req: Request, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const { id } = req.params;
      const flow = await controller.getById(id);
      return res.json(flow);
    } catch (err) {
      return res.json({
        error: {
          status: err.statusCode,
          message: err.body.error.message,
        },
      });
    }
  }
);

export { router };
