import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import { AppConfig } from '../../config/configuration'

@Injectable()
export class MinioService {
    private readonly client: Minio.Client
    private readonly bucket: string
    private readonly logger = new Logger(MinioService.name)

    constructor(private config: ConfigService<AppConfig, true>) {
        const rawEndpoint = this.config.get('minio.endpoint', { infer: true }) ?? 'http://localhost:9000'
        // Parse the endpoint URL to extract host, port and SSL flag
        const url = rawEndpoint.startsWith('http') ? new URL(rawEndpoint) : new URL(`http://${rawEndpoint}`)
        const endPoint = url.hostname
        const port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 9000)
        const useSSL = url.protocol === 'https:'

        this.bucket = this.config.get('minio.bucket', { infer: true }) ?? 'yarijoo-files'

        this.client = new Minio.Client({
            endPoint,
            port,
            useSSL,
            accessKey: this.config.get('minio.accessKey', { infer: true }) ?? 'minioadmin',
            secretKey: this.config.get('minio.secretKey', { infer: true }) ?? 'minioadmin',
        })
    }

    async getPresignedUploadUrl(objectName: string, expiry = 3600): Promise<string> {
        try {
            await this.ensureBucket()
            return await this.client.presignedPutObject(this.bucket, objectName, expiry)
        } catch (err) {
            this.logger.error('Failed to generate presigned URL', err)
            throw err
        }
    }

    async putObject(objectName: string, buffer: Buffer, contentType: string): Promise<void> {
        try {
            await this.ensureBucket()
            await this.client.putObject(this.bucket, objectName, buffer, buffer.length, {
                'Content-Type': contentType,
            })
            this.logger.log(`Uploaded object: ${objectName}`)
        } catch (err) {
            this.logger.error(`Failed to upload object ${objectName}`, err)
            throw err
        }
    }

    async getPresignedDownloadUrl(objectName: string, expiry = 3600): Promise<string> {
        try {
            return await this.client.presignedGetObject(this.bucket, objectName, expiry)
        } catch (err) {
            this.logger.error('Failed to generate presigned download URL', err)
            throw err
        }
    }

    getPublicUrl(objectName: string): string {
        const rawEndpoint = this.config.get('minio.endpoint', { infer: true }) ?? 'http://localhost:9000'
        return `${rawEndpoint}/${this.bucket}/${objectName}`
    }

    private async ensureBucket(): Promise<void> {
        try {
            const exists = await this.client.bucketExists(this.bucket)
            if (!exists) {
                await this.client.makeBucket(this.bucket, 'us-east-1')
                this.logger.log(`Bucket '${this.bucket}' created`)
            }
        } catch (err) {
            this.logger.warn('Could not verify/create bucket (MinIO may be unavailable)', err)
        }
    }
}
