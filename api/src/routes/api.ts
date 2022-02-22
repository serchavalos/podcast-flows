import { Router, Request, Response, NextFunction } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import { PodcastFlowController } from "../lib/podcast-flows/controller";

import { getBearerMiddleware } from "../middlewares/bearer-token";
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

type PodcastFlowResponse = Response<{}, { controller: PodcastFlowController }>;

const router = Router();
router.use(getBearerMiddleware());
router.use((req: Request, res: Response, next: NextFunction) => {
  const db = initDatabase();
  const { username, accessToken } = req.user;
  const api = new SpotifyWebApi();
  api.setAccessToken(accessToken);

  res.locals.controller = new PodcastFlowController(username, api, db);
  next();
});

router.get(
  "/podcast-flows/",
  async (req: Request, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const flows = await controller.getAll();
      return res.json(flows);
    } catch (err) {
      if (!err.statusCode) {
        return res.json({
          error: {
            status: err.code || 400,
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

router.post(
  "/podcast-flows/",
  async (req: Request<{}, {}, PodcastFlow>, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const { name, showIds = [], interval } = req.body;
      const flowId = await controller.addNew(name, showIds, interval);
      return res.json({ flowId });
    } catch (err) {
      if (!err.statusCode) {
        return res.json({
          error: {
            status: err.code || 400,
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

router.delete(
  "/podcast-flows/:id",
  async (req: Request, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const { id } = req.params;
      const flow = await controller.getById(id);
      if (!flow) {
        return res.json({
          error: {
            status: 404,
            message: "Podcast flow not found",
          },
        });
      }
      await controller.delete(id);
      return res.status(200);
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
