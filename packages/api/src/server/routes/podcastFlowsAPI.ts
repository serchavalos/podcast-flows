import { Router, Request, Response } from "express";
import { PodcastFlowController } from "../lib/podcast-flows/controller";

import { bearerMiddleware } from "../middlewares/bearer-token";
import { setupPodcastFlowControllerMiddleware } from "../middlewares/setup-podcast-controller";
import { PodcastFlow } from "../storage";

declare global {
  // TODO: Figure out how to move this to `tsconfig.json`
  // So far, `ts-node-dev` is not picking up this override
  namespace Express {
    interface User {
      username: string;
    }
  }
}

type PodcastFlowResponse = Response<{}, { controller: PodcastFlowController }>;

const router = Router();
router.use(bearerMiddleware);
router.use(setupPodcastFlowControllerMiddleware);

router.options("/", (_: Request, res: Response) => {
  res.sendStatus(204);
});
router.get("/", async (req: Request, res: PodcastFlowResponse) => {
  const { controller } = res.locals;

  try {
    const flows = await controller.getAll();
    res.setHeader("Access-Control-Max-Age", 86400);

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
});

router.post(
  "/",
  async (req: Request<{}, {}, PodcastFlow>, res: PodcastFlowResponse) => {
    const { controller } = res.locals;

    try {
      const { name, showIds = [], interval } = req.body;
      const flowId = await controller.addNew(name, showIds, interval);
      await controller.renew(flowId);
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

router.get("/:id", async (req: Request, res: PodcastFlowResponse) => {
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
});

router.delete("/:id", async (req: Request, res: PodcastFlowResponse) => {
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
    res.status(204);
    return res.json({});
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
});

router.put("/:id/renew", async (req: Request, res: PodcastFlowResponse) => {
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
    await controller.renew(id);
    res.status(204);
    return res.json({});
  } catch (err) {
    // TODO Time to refactor this error handling
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
});

export { router };
