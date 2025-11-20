import * as nodemailer from "nodemailer";
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
}

export interface EmailMetadata {
  to: string;
  subject?: string;
  fullName?: string;
  verificationCode?: string;
  resetLink?: string;
  organizationName?: string;
  [key: string]: any;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor(private configService?: ConfigService) {
    this.config = {
      host:
        this.configService?.get("smtp.host") ||
        process.env.SMTP_HOST ||
        "smtp.gmail.com",
      port:
        this.configService?.get("smtp.port") ||
        parseInt(process.env.SMTP_PORT || "587"),
      secure:
        this.configService?.get("smtp.secure") ||
        process.env.SMTP_PORT === "465",
      auth: {
        user:
          this.configService?.get("smtp.user") || process.env.SMTP_USER || "",
        pass:
          this.configService?.get("smtp.pass") || process.env.SMTP_PASS || "",
      },
      from: this.configService?.get("smtp.from") || process.env.SMTP_USER || "",
    };

    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth,
    });
  }

  private async getTemplate(templateName: string): Promise<string> {
    // Use process.cwd() to get the project root directory
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      `${templateName}.hbs`
    );

    try {
      return fs.readFileSync(templatePath, "utf8");
    } catch (error) {
      throw new Error(
        `Template not found: ${templateName}.hbs at path: ${templatePath}`
      );
    }
  }

  private async renderTemplate(
    templateName: string,
    data: Record<string, any>
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
    };

    return templates[emailType];
  }

  private prepareTemplateData(
    emailType: EmailType,
    metadata: EmailMetadata
  ): Record<string, any> {
    const baseData = {
      userName: metadata.userName || "User",
      organizationName: metadata.organizationName || "Nepal Climate Hub",
      currentYear: new Date().getFullYear(),
      siteUrl: this.configService?.get("urls.baseUrl") || process.env.BASE_URL,
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
          loginLink: `${baseData.siteUrl}/login`,
        };

      case EmailType.EMAIL_VERIFIED:
        return {
          ...baseData,
          dashboardLink: `${baseData.siteUrl}/dashboard`,
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
          loginLink: `${baseData.siteUrl}/login`,
        };

      default:
        return baseData;
    }
  }

  async sendEmail(
    emailType: EmailType,
    metadata: EmailMetadata
  ): Promise<boolean> {
    try {
      const templateName = this.getTemplateName(emailType);
      const templateData = this.prepareTemplateData(emailType, metadata);

      const htmlContent = await this.renderTemplate(templateName, templateData);
      const subject = this.getSubject(emailType, metadata);

      const mailOptions = {
        from: this.config.from,
        to: metadata.to,
        subject,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("SMTP connection failed:", error);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();

// Main function for sending emails - simplified interface
export const sendEmail = async (
  emailType: EmailType,
  metadata: EmailMetadata
): Promise<any> => {
  try {
    const result = await emailService.sendEmail(emailType, metadata);
    return { success: result, message: "Email sent successfully" };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, message: "Failed to send email" };
  }
};
