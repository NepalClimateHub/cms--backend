import { EmailClient } from "@azure/communication-email";
import * as handlebars from "handlebars";
import * as fs from "fs";
import * as path from "path";
import { ConfigService } from "@nestjs/config";

export enum EmailType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  WELCOME_EMAIL = "WELCOME_EMAIL",
  EMAIL_VERIFIED = "EMAIL_VERIFIED",
  PASSWORD_RESET = "PASSWORD_RESET",
  PASSWORD_RESET_SUCCESS = "PASSWORD_RESET_SUCCESS",
  ORGANIZATION_VERIFIED = "ORGANIZATION_VERIFIED",
  DB_BACKUP = "DB_BACKUP",
}

export interface EmailMetadata {
  to: string;
  subject?: string;
  fullName?: string;
  verificationCode?: string;
  resetLink?: string;
  organizationName?: string;
  backupDate?: string;
  attachments?: Array<{
    name: string;
    contentType: string;
    contentInBase64: string;
  }>;
  [key: string]: any;
}

export interface EmailConfig {
  connectionString: string;
  senderAddress: string;
}

class EmailService {
  private client: EmailClient;
  private config: EmailConfig;

  constructor(private configService?: ConfigService) {
    this.config = {
      connectionString:
        this.configService?.get("azureEmail.connectionString") ||
        process.env.AZURE_COMMUNICATION_CONNECTION_STRING ||
        "",
      senderAddress:
        this.configService?.get("azureEmail.senderAddress") ||
        process.env.SENDER_EMAIL_ADDRESS ||
        "",
    };

    this.client = new EmailClient(this.config.connectionString);
  }

  private async getTemplate(templateName: string): Promise<string> {
    // Use process.cwd() to get the project root directory
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      `${templateName}.hbs`,
    );

    try {
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      throw new Error(
        `Template not found: ${templateName}.hbs at path: ${templatePath}`,
      );
    }
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>,
  ): Promise<string> {
    const templateContent = await this.getTemplate(templateName);
    const template = handlebars.compile(templateContent);
    return template(data);
  }

  private getSubject(emailType: EmailType, metadata: EmailMetadata): string {
    const subjects = {
      [EmailType.EMAIL_VERIFICATION]: "Verify Your Email - Nepal Climate Hub",
      [EmailType.WELCOME_EMAIL]: "Welcome to Nepal Climate Hub!",
      [EmailType.EMAIL_VERIFIED]:
        "Email Verified Successfully - Nepal Climate Hub",
      [EmailType.PASSWORD_RESET]: "Reset Your Password - Nepal Climate Hub",
      [EmailType.PASSWORD_RESET_SUCCESS]:
        "Password Reset Successful - Nepal Climate Hub",
      [EmailType.ORGANIZATION_VERIFIED]:
        "Your organization is verified - Nepal Climate Hub",
      [EmailType.DB_BACKUP]: "Database Backup - Nepal Climate Hub",
    };

    return metadata.subject || subjects[emailType] || "Nepal Climate Hub";
  }

  private getTemplateName(emailType: EmailType): string {
    const templates = {
      [EmailType.EMAIL_VERIFICATION]: "email-verification",
      [EmailType.WELCOME_EMAIL]: "welcome",
      [EmailType.EMAIL_VERIFIED]: "email-verified",
      [EmailType.PASSWORD_RESET]: "password-reset",
      [EmailType.PASSWORD_RESET_SUCCESS]: "password-reset-success",
      [EmailType.ORGANIZATION_VERIFIED]: "organization-verified",
      [EmailType.DB_BACKUP]: "db-backup",
    };

    return templates[emailType];
  }

  private prepareTemplateData(
    emailType: EmailType,
    metadata: EmailMetadata,
  ): Record<string, any> {
    const baseData = {
      userName: metadata.userName || "User",
      organizationName: metadata.organizationName || "Nepal Climate Hub",
      currentYear: new Date().getFullYear(),
      siteUrl: this.configService?.get("urls.baseUrl") || process.env.BASE_URL,
      frontendBaseUrl:
        this.configService?.get("urls.frontendBaseUrl") ||
        process.env.FRONTEND_BASE_URL,
    };

    switch (emailType) {
      case EmailType.EMAIL_VERIFICATION:
        return {
          ...baseData,
          verificationLink: `${baseData.siteUrl}/auth/verify-email?token=${metadata.verificationCode}`,
        };

      case EmailType.WELCOME_EMAIL:
        return {
          ...baseData,
          loginLink: `${baseData.frontendBaseUrl}/login`,
        };

      case EmailType.EMAIL_VERIFIED:
        return {
          ...baseData,
          dashboardLink: `${baseData.frontendBaseUrl}/dashboard`,
        };

      case EmailType.PASSWORD_RESET:
        return {
          ...baseData,
          resetLink: metadata.resetLink,
          resetCode: metadata.verificationCode,
        };

      case EmailType.PASSWORD_RESET_SUCCESS:
        return {
          ...baseData,
          loginLink: `${baseData.frontendBaseUrl}/login`,
        };

      case EmailType.ORGANIZATION_VERIFIED:
        return {
          ...baseData,
          dashboardLink: `${baseData.frontendBaseUrl}/dashboard`,
          profileLink: `${baseData.frontendBaseUrl}/dashboard/profile`,
        };

      case EmailType.DB_BACKUP:
        return {
          ...baseData,
          backupDate: metadata.backupDate || new Date().toLocaleString(),
        };

      default:
        return baseData;
    }
  }

  async sendEmail(
    emailType: EmailType,
    metadata: EmailMetadata,
  ): Promise<boolean> {
    try {
      const templateName = this.getTemplateName(emailType);
      const templateData = this.prepareTemplateData(emailType, metadata);

      const htmlContent = await this.renderTemplate(templateName, templateData);
      const subject = this.getSubject(emailType, metadata);

      const poller = await this.client.beginSend({
        senderAddress: this.config.senderAddress,
        content: {
          subject,
          html: htmlContent,
        },
        recipients: {
          to: [{ address: metadata.to }],
        },
        attachments: metadata.attachments,
      });

      const result = await poller.pollUntilDone();
      console.log(`Email sent successfully: ${result.id}`);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      return !!this.config.connectionString && !!this.config.senderAddress;
    } catch (error) {
      console.error("Azure email connection verification failed:", error);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();

// Main function for sending emails - simplified interface
export const sendEmail = async (
  emailType: EmailType,
  metadata: EmailMetadata,
): Promise<any> => {
  try {
    const result = await emailService.sendEmail(emailType, metadata);
    return { success: result, message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, message: "Failed to send email" };
  }
};
