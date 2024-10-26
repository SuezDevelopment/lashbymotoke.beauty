import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db"; 
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            let data = req.body
            await MongoDbConnection.connect();
            const letsTalkCollection = await MongoDbConnection.getCollection('lets_talk');

            const newLetsTalk = data;
            console.log(newLetsTalk);
            
            const result = await letsTalkCollection.insertOne(newLetsTalk);
            if (result.acknowledged && result.insertedId) {
                res.status(200).json({ status: true, message: "Message delivered successfully" });
            } else {
                res.status(401).json({ status: false, message: "Something went wrong. Try again" });
            }
        } catch (error) {
            console.error("Error during let's talk:", error);
            res.status(500).json({ status: false, message: "Something went wrong. Try again" });
        }
    } else {
        res.status(405).json({ status: false, message: "Method not allowed" });
    }
}