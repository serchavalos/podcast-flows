import { Router } from "express";

import { getBearerPassportMiddleware } from "../middlewares/bearer-passport";

const router = Router();

router.get("/flows/", getBearerPassportMiddleware(), (req, res) => {
  res.json({
    flows: ["muchos", "flows"],
    user: req.user,
  });
});

export { router };
