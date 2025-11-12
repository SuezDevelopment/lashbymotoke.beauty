import type { NextApiRequest, NextApiResponse } from 'next';
import MongoDbConnection from '@/lib/db';
import EmailService from '@/lib/email';

interface TrainingApplicationPayload {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  selectedCrafts: string[];
  trainingType: string; // internship | workshop | masterclass
  level?: string;
  paymentPlan: 'one-time' | 'monthly';
  notes?: string;
  consentFees?: boolean;
  location?: string; // studio-only
  schedule?: string; // ongoing
  createdAt?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sanitizeString(s?: any, maxLen: number = 200): string | undefined {
  if (typeof s !== 'string') return undefined;
  const trimmed = s.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLen);
}

function validate(payload: any): { ok: boolean; data?: TrainingApplicationPayload; errors?: string[] } {
  const errors: string[] = [];
  const fullName = sanitizeString(payload?.fullName, 120);
  const phoneNumber = sanitizeString(payload?.phoneNumber, 40);
  const emailAddress = sanitizeString(payload?.emailAddress, 140);
  const selectedCrafts = Array.isArray(payload?.selectedCrafts) ? payload.selectedCrafts.filter((c: any) => typeof c === 'string').slice(0, 20) : [];
  const trainingType = sanitizeString(payload?.trainingType, 40) || 'internship';
  const level = sanitizeString(payload?.level, 60);
  const paymentPlanRaw = sanitizeString(payload?.paymentPlan, 20) || 'one-time';
  const paymentPlan = paymentPlanRaw === 'monthly' ? 'monthly' : 'one-time';
  const notes = sanitizeString(payload?.notes, 1000);
  const consentFees = Boolean(payload?.consentFees);
  const location = 'studio';
  const schedule = 'ongoing';
  const createdAt = (typeof payload?.createdAt === 'string' && payload.createdAt) ? payload.createdAt : new Date().toISOString();

  if (!fullName) errors.push('fullName is required');
  if (!phoneNumber) errors.push('phoneNumber is required');
  if (!emailAddress || !isValidEmail(emailAddress)) errors.push('valid emailAddress is required');
  if (selectedCrafts.length === 0) errors.push('At least one craft must be selected');

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    data: {
      fullName: fullName as string,
      phoneNumber: phoneNumber as string,
      emailAddress: emailAddress as string,
      selectedCrafts,
      trainingType,
      level,
      paymentPlan,
      notes,
      consentFees,
      location,
      schedule,
      createdAt,
    },
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }
  try {
    const result = validate(req.body);
    if (!result.ok || !result.data) {
      return res.status(400).json({ status: false, message: 'Invalid application', errors: result.errors });
    }
    const app = result.data;
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('training_applications');
    const insert = await col.insertOne(app);

    // Send confirmation email (non-blocking for success)
    const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
    const senderAddress = process.env.SENDER_ADDRESS || 'DoNotReply@lashbymotoke.beauty';
    if (connectionString) {
      try {
        const emailService = new EmailService(connectionString);
        const html = await emailService.renderTemplate('applications', {
          fullName: app.fullName,
          emailAddress: app.emailAddress,
          phoneNumber: app.phoneNumber,
          trainingType: app.trainingType,
          level: app.level || '-',
          paymentPlan: app.paymentPlan,
          crafts: app.selectedCrafts.join(', '),
          notes: app.notes || '-',
          location: app.location,
          schedule: app.schedule,
          submittedAt: new Date(app.createdAt || Date.now()).toLocaleString(),
        });
        await emailService.sendEmail({
          fromAddress: senderAddress,
          toAddress: app.emailAddress,
          subject: `Application received — LashByMotoke Academy`,
          content: html,
        });
      } catch (mailErr) {
        console.warn('Email send failed for training application:', mailErr);
        // Do not fail the request if email sending fails
      }
    }

    return res.status(200).json({ status: true, id: insert.insertedId?.toString() });
  } catch (err) {
    console.error('Error submitting training application:', err);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}