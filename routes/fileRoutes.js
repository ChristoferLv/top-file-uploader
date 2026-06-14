import { Router } from "express";
import { fileListGet, newFileFormGet, newFileFormPost } from "../controllers/filesController.js";
const filesRouter = Router();

filesRouter.get("/", fileListGet)
filesRouter.get("/new-file", newFileFormGet)
filesRouter.post("/new-file", newFileFormPost)


export default filesRouter;
