import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import EmailService from '@/lib/email';
import { logAudit } from '@/lib/audit';

function hasPerm(session: any, perm: string) {
  const permissions = (session as any)?.permissions || [];
  return permissions.includes(perm);
}

/**
 * Admin-only: send a test email using existing templates and Azure Communication Email.
 * POST body: { to: string; template?: 'applications'|'bookings'|'raw'; subject?: string; content?: string; templateData?: any }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Method not allowed' });

  if (!hasPerm(session, 'templates:read')) {
    return res.status(403).json({ status: false, message: 'Forbidden' });
  }

  const connectionString = process.env.COMMUNICATION_SERVICE_CONNECTION_STRING;
  const senderAddress = process.env.SENDER_ADDRESS || 'DoNotReply@lashbymotoke.beauty';
  if (!connectionString) {
    return res.status(400).json({ status: false, message: 'COMMUNICATION_SERVICE_CONNECTION_STRING is not configured' });
  }

  try {
    const { to, template = 'applications', subject, content, templateData } = req.body || {};
    const toAddress: string = String(to || '').trim();
    if (!toAddress || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toAddress)) {
      return res.status(400).json({ status: false, message: 'Valid recipient email (to) is required' });
    }

    const emailService = new EmailService(connectionString);
    let html: string = '';
    if (template === 'raw') {
      html = typeof content === 'string' && content.trim() ? content : '<p>This is a raw test email.</p>';
    } else if (template === 'bookings') {
      const data = templateData || {
        fullName: 'Test User',
        emailAddress: toAddress,
        phoneNumber: '+1234567890',
        serviceType: 'studio',
        scheduleDate: new Date().toISOString().slice(0,10),
        scheduleTime: '10:00',
        scheduleLocation: 'mainland',
        scheduleDuration: '1hr',
        submittedAt: new Date().toLocaleString(),
      };
      html = await emailService.renderTemplate('bookings', data);
    } else {
      const data = templateData || {
        fullName: 'Test Applicant',
        emailAddress: toAddress,
        phoneNumber: '+1234567890',
        trainingType: 'workshop',
        level: 'beginner',
        paymentPlan: 'one-time',
        crafts: 'Classic, Hybrid',
        notes: '-',
        location: 'studio',
        schedule: 'ongoing',
        submittedAt: new Date().toLocaleString(),
      };
      html = await emailService.renderTemplate('applications', data);
    }

    const subj = subject || (template === 'bookings' ? 'Test booking confirmation' : template === 'raw' ? 'Test email' : 'Test application confirmation');
    await emailService.sendEmail({ fromAddress: senderAddress, toAddress, subject: subj, content: html });
    await logAudit(session, 'templates:test-send', 'email', { toAddress, subject: subj, template });
    return res.status(200).json({ status: true, message: 'Email sent' });
  } catch (error) {
    console.error('Test email send failed:', error);
    await logAudit(session, 'templates:test-send:error', 'email', { message: String(error) });
    return res.status(500).json({ status: false, message: 'Failed to send test email' });
  }
}