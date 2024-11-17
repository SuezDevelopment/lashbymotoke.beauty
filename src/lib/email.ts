import { EmailClient, EmailMessage } from "@azure/communication-email"
import path from "path";
import fs from 'fs/promises';
import Handlebars from 'handlebars';

class EmailService {
    private client: EmailClient;
    private templatesDir: string;

    constructor(connectionString: string, templatesDir: string = 'src/templates') {
        this.client = new EmailClient(connectionString);
        this.templatesDir = templatesDir;
    }

    async loadTemplate(templateName: string, data: Record<string, any>): Promise<string> {
        const templatePath = path.join(this.templatesDir, `${templateName}.html`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        const template = Handlebars.compile(templateContent);
        return template(data);
      }

    async sendEmail(
        { senderAddress, recipientAddress, subject, templateName, templateData }: {
            senderAddress: string,
            recipientAddress: string,
            subject: string,
            templateName: string,
            templateData: Record<string, any>
        }
    ): Promise<void> {
        const htmlContent = await this.loadTemplate(templateName, templateData);

        const message: EmailMessage = {
            senderAddress,
            content: {
                subject,
                html: htmlContent,
            },
            recipients: {
                to: [{ address: recipientAddress }],
            },
        };

        try {
            const poller = await this.client.beginSend(message);
            await poller.pollUntilDone();
        } catch (error) {
            throw new Error(`Failed to send email: ${error}`);
        }
    }
}
export default EmailService;
