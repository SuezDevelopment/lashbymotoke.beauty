import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import EmailService from "@/lib/email";
import { formatDate, formatTime } from "@/lib/tools";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            let data = req.body
            await MongoDbConnection.connect();
            const sessionBookingCollection = await MongoDbConnection.getCollection('session_bookings');

            const newSessionBooking = data;
            console.log(newSessionBooking);

            const result = await sessionBookingCollection.insertOne(newSessionBooking);
            if (result.acknowledged && result.insertedId) {
                const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
                if (!connectionString) {
                    throw new Error("COMMUNICATION_SERVICE_CONNECTION_STRING is not set in environment variables");
                }
                const emailService = new EmailService(connectionString);
                const senderAddress = process.env.SENDER_ADDRESS || "DoNotReply@lashbymotoke.beauty";

                await emailService.sendEmail({
                    senderAddress,
                    recipientAddress: newSessionBooking.emailAddress,
                    subject: "LashByMotoke Booking Confirmation",
                    templateName: "bookings",
                    templateData: {                        service: newSessionBooking.serviceType == "studio" ? "Studio lash session" : "Home lash session",
                        name: newSessionBooking.fullName,
                        date: formatDate(newSessionBooking.scheduleDate),
                        time: formatTime(newSessionBooking.scheduleTime),
                        location: newSessionBooking.serviceType == "studio" ? "133 Ahmadu Bello Wy, VI, Lagos" : newSessionBooking.scheduleLocation == "mainland" ? "Mainland (Yaba, Ikeja, Surulere)" : newSessionBooking.scheduleLocation == "island-1" ? "Island (Victoria island, Ikoyi, Banana island)" : newSessionBooking.scheduleLocation == "island-2" ? "Island (Lekki, Ikate, Chevron)" : "Island (Ajah, Lekki garden)",
                        duration: newSessionBooking.fullName,
                        specialRequest: newSessionBooking.specialRequest,
                        // username: newSessionBooking.fullName,
                    },
                });

                res.status(200).json({ status: true, message: "Registered session booking successfully" });
            } else {
                res.status(401).json({ status: false, message: "Something went wrong. Try again" });
            }
        } catch (error) {
            console.error("Error during session booking:", error);
            res.status(500).json({ status: false, message: "Something went wrong. Try again"+error });
        }
    } else {
        res.status(405).json({ status: false, message: "Method not allowed" });
    }
}