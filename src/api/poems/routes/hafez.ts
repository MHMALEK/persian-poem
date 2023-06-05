// import app from "index";

import axios from "axios";
import { Request, Response } from "express";
import { getHafezPoemsPersian } from "../../../services/http/hafez";

const hafezController = async (req: Request, res: Response) => {
  await getHafezPoemsPersian();
  res.send("Hafez");
};

const HafezGetPoems = () => {};

export default hafezController;
