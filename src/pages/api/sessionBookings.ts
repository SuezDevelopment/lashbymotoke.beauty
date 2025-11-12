import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import EmailService from "@/lib/email";
import { formatDate, formatTime } from "@/lib/tools";
import type { SessionBooking, ServiceType } from "@/lib/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  // Accept E.164 (+234...) or local starting with 0 and 11 digits
  return /(^(\+?\d{10,15}|0\d{10,11})$)/.test(phone);
}

function validatePayload(body: any): { ok: boolean; errors?: string[]; data?: SessionBooking } {
  const errors: string[] = [];
  const sanitize = (v: any) => (typeof v === "string" ? v.trim() : v);

  const data: SessionBooking = {
    serviceType: sanitize(body?.serviceType),
    scheduleDate: sanitize(body?.scheduleDate),
    scheduleTime: sanitize(body?.scheduleTime),
    scheduleLocation: sanitize(body?.scheduleLocation),
    scheduleDuration: sanitize(body?.scheduleDuration),
    specialRequest: sanitize(body?.specialRequest),
    fullName: sanitize(body?.fullName),
    phoneNumber: sanitize(body?.phoneNumber),
    emailAddress: sanitize(body?.emailAddress),
    homeAddress: sanitize(body?.homeAddress),
  } as SessionBooking;

  if (!data.serviceType || (data.serviceType !== "studio" && data.serviceType !== "home")) {
    errors.push("serviceType must be 'studio' or 'home'.");
  }
  if (!data.scheduleDate) errors.push("scheduleDate is required.");
  if (!data.scheduleTime) errors.push("scheduleTime is required.");
  if (!data.fullName) errors.push("fullName is required.");
  if (!data.emailAddress || !isValidEmail(data.emailAddress)) errors.push("A valid emailAddress is required.");
  if (!data.phoneNumber || !isValidPhone(data.phoneNumber)) errors.push("A valid phoneNumber is required.");
  if (data.serviceType === "home") {
    if (!data.scheduleLocation) errors.push("scheduleLocation is required for home service.");
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data };
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        try {
            let data = req.body
            await MongoDbConnection.connect();
            const sessionBookingCollection = await MongoDbConnection.getCollection('session_bookings');

            // Validate and sanitize payload
            const resultValidation = validatePayload(data);
            if (!resultValidation.ok || !resultValidation.data) {
                return res.status(400).json({ status: false, message: "Invalid booking data", errors: resultValidation.errors });
            }

            const newSessionBooking = resultValidation.data;
            console.log({ booking: {
              serviceType: newSessionBooking.serviceType,
              scheduleDate: newSessionBooking.scheduleDate,
              scheduleTime: newSessionBooking.scheduleTime,
              scheduleLocation: newSessionBooking.scheduleLocation,
              scheduleDuration: newSessionBooking.scheduleDuration,
              // Avoid logging PII like email and phone fully
            }});

            const result = await sessionBookingCollection.insertOne(newSessionBooking);
            if (result.acknowledged && result.insertedId) {
                const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
                if (!connectionString) {
                    throw new Error("COMMUNICATION_SERVICE_CONNECTION_STRING is not set in environment variables");
                }
                const emailService = new EmailService(connectionString);
                const senderAddress = process.env.SENDER_ADDRESS || "DoNotReply@lashbymotoke.beauty";
                const derivedDuration = newSessionBooking.scheduleDuration && newSessionBooking.scheduleDuration.trim().length > 0
                    ? newSessionBooking.scheduleDuration
                    : (newSessionBooking.serviceType === "studio" ? "1hr" : "1hr 30mins");

                await emailService.sendEmail({
                    senderAddress,
                    recipientAddress: newSessionBooking.emailAddress,
                    subject: "LashByMotoke Booking Confirmation",
                    templateName: "bookings",
                    templateData: {
                        service: newSessionBooking.serviceType == "studio" ? "Studio lash session" : "Home lash session",
                        name: newSessionBooking.fullName,
                        date: formatDate(newSessionBooking.scheduleDate),
                        time: formatTime(newSessionBooking.scheduleTime),
                        location: newSessionBooking.serviceType == "studio" ? "133 Ahmadu Bello Wy, VI, Lagos" : newSessionBooking.scheduleLocation == "mainland" ? "Mainland (Yaba, Ikeja, Surulere)" : newSessionBooking.scheduleLocation == "island-1" ? "Island (Victoria island, Ikoyi, Banana island)" : newSessionBooking.scheduleLocation == "island-2" ? "Island (Lekki, Ikate, Chevron)" : "Island (Ajah, Lekki garden)",
                        duration: derivedDuration,
                        specialRequest: newSessionBooking.specialRequest,
                        // username: newSessionBooking.fullName,
                    },
                });

                res.status(200).json({ status: true, message: "Registered session booking successfully" });
            } else {
                res.status(500).json({ status: false, message: "Failed to insert booking" });
            }
        } catch (error) {
            console.error("Error during session booking:", error);
            res.status(500).json({ status: false, message: "Something went wrong. Try again", error: (error as Error)?.message });
        }
    } else {
        res.status(405).json({ status: false, message: "Method not allowed" });
    }
}