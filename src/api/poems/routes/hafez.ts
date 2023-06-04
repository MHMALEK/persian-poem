// import app from "index";

import axios from "axios";
import { Request, Response } from "express";
import { getHafezPoemsAPI } from "../../../services/http/hafez";

const hafezController = async (req: Request, res: Response) => {
  await getHafezPoemsAPI();
  res.send("Hafez");
};

const HafezGetPoems = () => {};

export default hafezController;
