import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import { Response } from 'express';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  async exportDatabase(res: Response) {
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

    try {
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

      const output = fs.createWriteStream(zipPath);
      const archive = (archiver as any).default 
        ? (archiver as any).default('zip', { zlib: { level: 9 } }) 
        : (archiver as any)('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`Compression completed. Total size: ${archive.pointer()} bytes`);
        
        // Send the file to the client
        res.download(zipPath, zipFileName, (err: any) => {
          if (err) {
            this.logger.error('Error sending file to client', err);
          }
          // Cleanup
          this.cleanup(dumpPath, zipPath);
        });
      });

      archive.on('error', (err: any) => {
        this.logger.error('Archiver error', err);
        throw err;
      });

      archive.pipe(output);
      archive.file(dumpPath, { name: dumpFileName });
      await archive.finalize();

    } catch (error: any) {
      this.logger.error('Database export failed', error);
      this.cleanup(dumpPath, zipPath);
      throw new InternalServerErrorException('Failed to export database');
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
