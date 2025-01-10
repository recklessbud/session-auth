import { Request, Response } from "express";

export const homepage = (req: Request, res: Response) =>  
{
    res.status(200).render("home", {title: "Home"});
}