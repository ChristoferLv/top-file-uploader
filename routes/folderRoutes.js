import { Router } from "express";
import { createNewFolderPost, fileListFromFolderGet } from "../controllers/folderController.js";
const folderRoutes = Router();


folderRoutes.get("/:id", fileListFromFolderGet)
folderRoutes.post("/", createNewFolderPost)


export default folderRoutes;
