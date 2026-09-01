import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import * as PDFDocument from 'pdfkit'
import { Readable } from 'stream'

@Injectable()
export class CertificateService {
    private readonly logger = new Logger(CertificateService.name)

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Generate a PDF certificate for a completed course enrollment.
     * Returns the PDF as a Buffer.
     */
    async generateCertificate(userId: string, courseSlug: string): Promise<Buffer> {
        // Load course
        const course = await this.prisma.course.findUnique({
            where: { slug: courseSlug },
            include: {
                enrollments: {
                    where: { userId },
                    take: 1,
                },
            },
        })

        if (!course) throw new NotFoundException('دوره یافت نشد')

        const enrollment = course.enrollments[0]
        if (!enrollment) throw new ForbiddenException('شما در این دوره ثبت‌نام نکرده‌اید')
        if (enrollment.completionPercent < 100) {
            throw new ForbiddenException('دوره هنوز تکمیل نشده است')
        }

        // Load user name
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { fullName: true },
        })

        const userName = user?.fullName ?? 'کاربر یاری‌جو'
        const courseTitle = course.title
        const completionDate = enrollment.enrolledAt.toLocaleDateString('fa-IR')

        return this.buildPdf(userName, courseTitle, completionDate)
    }

    /**
     * Build the PDF document and return it as a Buffer.
     * Uses Latin fallback text since pdfkit's built-in fonts don't support Persian.
     * For production, register a Persian font (e.g., Vazirmatn).
     */
    private buildPdf(userName: string, courseTitle: string, completionDate: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margin: 60,
                info: {
                    Title: 'Certificate of Completion — Yarijoo',
                    Author: 'Yarijoo Platform',
                },
            })

            const chunks: Buffer[] = []
            const stream = doc as unknown as Readable
            stream.on('data', (chunk: Buffer) => chunks.push(chunk))
            stream.on('end', () => resolve(Buffer.concat(chunks)))
            stream.on('error', reject)

            const pageWidth = doc.page.width
            const pageHeight = doc.page.height
            const cx = pageWidth / 2

            // ── Background ────────────────────────────────────────────────
            doc.rect(0, 0, pageWidth, pageHeight).fill('#F9F6F0')

            // Outer decorative border
            doc.rect(20, 20, pageWidth - 40, pageHeight - 40)
                .lineWidth(3)
                .stroke('#1B4332')

            // Inner border
            doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
                .lineWidth(1)
                .stroke('#2D6A4F')

            // ── Header ────────────────────────────────────────────────────
            doc.fontSize(10).fillColor('#2D6A4F').font('Helvetica')
                .text('YARIJOO MENTAL HEALTH PLATFORM', 0, 60, { align: 'center', width: pageWidth })

            doc.fontSize(28).fillColor('#1B4332').font('Helvetica-Bold')
                .text('CERTIFICATE OF COMPLETION', 0, 90, { align: 'center', width: pageWidth })

            // Decorative divider
            const divY = 135
            doc.moveTo(cx - 200, divY).lineTo(cx + 200, divY).lineWidth(1.5).stroke('#1B4332')

            // ── Body ──────────────────────────────────────────────────────
            doc.fontSize(13).fillColor('#555').font('Helvetica')
                .text('This certificate is proudly presented to', 0, 155, { align: 'center', width: pageWidth })

            // Recipient name
            doc.fontSize(32).fillColor('#1B4332').font('Helvetica-BoldOblique')
                .text(userName, 0, 185, { align: 'center', width: pageWidth })

            // Underline name
            const nameY = 185 + 32 + 6
            doc.moveTo(cx - 180, nameY).lineTo(cx + 180, nameY).lineWidth(1).stroke('#2D6A4F')

            doc.fontSize(13).fillColor('#555').font('Helvetica')
                .text('for successfully completing the course', 0, nameY + 16, { align: 'center', width: pageWidth })

            // Course title (wrap if long)
            doc.fontSize(20).fillColor('#1C1C1E').font('Helvetica-Bold')
                .text(`"${courseTitle}"`, 80, nameY + 42, { align: 'center', width: pageWidth - 160 })

            // ── Footer ────────────────────────────────────────────────────
            const footerY = pageHeight - 110

            // Date + platform signature
            doc.fontSize(11).fillColor('#444').font('Helvetica')
                .text(`Completion Date: ${completionDate}`, 80, footerY, { width: 220, align: 'center' })

            // Signature line left
            doc.moveTo(80, footerY + 35).lineTo(300, footerY + 35).lineWidth(0.8).stroke('#888')
            doc.fontSize(10).fillColor('#888')
                .text('Instructor Signature', 80, footerY + 40, { width: 220, align: 'center' })

            // Signature line right
            doc.moveTo(pageWidth - 300, footerY + 35).lineTo(pageWidth - 80, footerY + 35).lineWidth(0.8).stroke('#888')
            doc.fontSize(10).fillColor('#888')
                .text('Yarijoo Platform', pageWidth - 300, footerY + 40, { width: 220, align: 'center' })

            // Certificate ID
            doc.fontSize(8).fillColor('#aaa')
                .text(
                    `Certificate ID: YRJ-${Date.now().toString(36).toUpperCase()}`,
                    0, pageHeight - 45,
                    { align: 'center', width: pageWidth },
                )

            doc.end()
        })
    }
}
