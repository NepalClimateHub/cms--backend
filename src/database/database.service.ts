import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { Response } from 'express';
import { sendEmail, EmailType } from '../utils/email.util';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) { }

  /**
   * Cron Job to automatically trigger a backup and email it every 10 days
   */
  @Cron('0 0 */10 * *')
  async handleCronBackup() {
    this.logger.log('Cron Job: Starting automated database backup and email');
    try {
      await this.backupAndEmailDatabase('tech.nepalclimatehub@gmail.com');
      this.logger.log('Cron Job: Automated database backup and email sent successfully');
    } catch (error) {
      this.logger.error('Cron Job: Automated database backup and email failed', error);
    }
  }

  /**
   * Helper function to perform a database dump and package it into a zip file.
   * Returns path information of the generated files.
   */
  async generateBackup(): Promise<{ dumpPath: string; zipPath: string; zipFileName: string; dumpFileName: string }> {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new InternalServerErrorException('DATABASE_URL not found in environment');
    }

    const tempDir = path.join(process.cwd(), 'temp-exports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dumpFileName = `nch_cms_backup_${timestamp}.sql`;
    const zipFileName = `nch_cms_backup_${timestamp}.zip`;
    const dumpPath = path.join(tempDir, dumpFileName);
    const zipPath = path.join(tempDir, zipFileName);

    this.logger.log(`Starting database dump to ${dumpPath}`);

    // Check for pg_dump and find its path if it's not in the PATH
    let pgDumpPath = 'pg_dump';
    try {
      await execPromise('pg_dump --version');
    } catch {
      this.logger.warn('pg_dump not found in PATH, searching in common locations...');
      const commonPaths = [
        '/opt/homebrew/bin/pg_dump',
        '/usr/local/bin/pg_dump',
        '/opt/homebrew/Cellar/postgresql@15/15.15_1/bin/pg_dump',
      ];
      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          pgDumpPath = p;
          this.logger.log(`Found pg_dump at ${pgDumpPath}`);
          break;
        }
      }
    }

    // pg_dump command using the database URL
    const env = { ...process.env };
    if (databaseUrl.includes(':') && databaseUrl.includes('@')) {
      const passwordPart = databaseUrl.split('@')[0].split(':').pop();
      if (passwordPart) {
        env['PGPASSWORD'] = passwordPart;
      }
    }

    try {
      await execPromise(`"${pgDumpPath}" "${databaseUrl}" -f "${dumpPath}" --no-owner --no-privileges`, { env });
    } catch (dumpError: any) {
      this.logger.error(`pg_dump failed: ${dumpError.stderr || dumpError.message}`);
      throw dumpError;
    }

    this.logger.log(`Database dump completed. Starting compression to ${zipPath}`);

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = (archiver as any).default
        ? (archiver as any).default('zip', { zlib: { level: 9 } })
        : (archiver as any)('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`Compression completed. Total size: ${archive.pointer()} bytes`);
        resolve();
      });

      archive.on('error', (err: any) => {
        this.logger.error('Archiver error', err);
        reject(err);
      });

      archive.pipe(output);
      archive.file(dumpPath, { name: dumpFileName });
      archive.finalize();
    });

    return { dumpPath, zipPath, zipFileName, dumpFileName };
  }

  /**
   * Standard endpoint action to export the database directly to client HTTP response stream
   */
  async exportDatabase(res: Response) {
    let dumpPath = '';
    let zipPath = '';
    try {
      const backup = await this.generateBackup();
      dumpPath = backup.dumpPath;
      zipPath = backup.zipPath;

      // Send the file to the client
      res.download(zipPath, backup.zipFileName, (err: any) => {
        if (err) {
          this.logger.error('Error sending file to client', err);
        }
        // Cleanup
        this.cleanup(dumpPath, zipPath);
      });
    } catch (error: any) {
      this.logger.error('Database export failed', error);
      this.cleanup(dumpPath, zipPath);
      throw new InternalServerErrorException('Failed to export database');
    }
  }

  /**
   * Helper function to perform a backup and send the zip file to the specified email recipient
   */
  async backupAndEmailDatabase(recipientEmail: string) {
    let dumpPath = '';
    let zipPath = '';
    try {
      const backup = await this.generateBackup();
      dumpPath = backup.dumpPath;
      zipPath = backup.zipPath;

      this.logger.log(`Encoding backup ZIP to base64...`);
      const contentInBase64 = fs.readFileSync(zipPath).toString('base64');

      this.logger.log(`Sending backup email to ${recipientEmail}...`);
      await sendEmail(EmailType.DB_BACKUP, {
        to: recipientEmail,
        backupDate: new Date().toLocaleString(),
        attachments: [
          {
            name: backup.zipFileName,
            contentType: 'application/zip',
            contentInBase64,
          },
        ],
      });

      this.logger.log(`Database backup email sent successfully to ${recipientEmail}`);
      this.cleanup(dumpPath, zipPath);
    } catch (error: any) {
      this.logger.error('Failed to backup and email database', error);
      this.cleanup(dumpPath, zipPath);
      throw error;
    }
  }

  private cleanup(...paths: string[]) {
    paths.forEach((p) => {
      if (fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
          this.logger.log(`Cleaned up temporary file: ${p}`);
        } catch (err) {
          this.logger.error(`Failed to cleanup file: ${p}`, err);
        }
      }
    });
  }
}
