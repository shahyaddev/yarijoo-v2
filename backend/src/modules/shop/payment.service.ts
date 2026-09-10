import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import axios from 'axios'

interface ZarinpalRequestResult {
    code: number
    message: string
    authority?: string
    fee?: number
}

interface ZarinpalVerifyResult {
    code: number
    message: string
    card_hash?: string
    card_pan?: string
    ref_id?: number
    fee?: number
}

interface ZarinpalApiResponse<T> {
    data: T
    errors: unknown[]
}

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name)
    private readonly merchantId: string
    private readonly sandbox: boolean
    private readonly baseUrl: string

    constructor(private config: ConfigService) {
        this.merchantId =
            this.config.get<string>('ZARINPAL_MERCHANT_ID') ?? 'SANDBOX_MERCHANT'
        this.sandbox = this.config.get<string>('ZARINPAL_SANDBOX') === 'true'
        this.baseUrl = this.sandbox
            ? 'https://sandbox.zarinpal.com/pg/v4/payment'
            : 'https://api.zarinpal.com/pg/v4/payment'
    }

    async requestPayment(
        amount: number,
        description: string,
        callbackUrl: string,
    ): Promise<{ authority: string; redirectUrl: string }> {
        // Dev/test mode: if merchant ID is placeholder, mock the payment
        if (
            !this.merchantId ||
            this.merchantId === 'SANDBOX_MERCHANT' ||
            this.merchantId.startsWith('XXXXXXXX')
        ) {
            const mockAuthority = `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
            this.logger.log(`[Payment] DEV MODE — mock authority: ${mockAuthority}`)
            // Return callback URL directly so order is immediately "paid"
            const devCallback = callbackUrl.includes('?')
                ? `${callbackUrl}&Authority=${mockAuthority}&Status=OK`
                : `${callbackUrl}?Authority=${mockAuthority}&Status=OK`
            return { authority: mockAuthority, redirectUrl: devCallback }
        }
        const response = await axios.post<ZarinpalApiResponse<ZarinpalRequestResult>>(
            `${this.baseUrl}/request.json`,
            {
                merchant_id: this.merchantId,
                amount,
                description,
                callback_url: callbackUrl,
            },
        )
        const { data } = response.data
        if (data.code !== 100 || !data.authority) {
            throw new Error(`Zarinpal error: ${data.message}`)
        }
        const gatewayBase = this.sandbox
            ? 'https://sandbox.zarinpal.com/pg/StartPay'
            : 'https://www.zarinpal.com/pg/StartPay'
        return {
            authority: data.authority,
            redirectUrl: `${gatewayBase}/${data.authority}`,
        }
    }

    async verifyPayment(
        authority: string,
        amount: number,
    ): Promise<{ refId: number; success: boolean }> {
        // Dev mode: TEST- authorities are always valid
        if (authority.startsWith('TEST-')) {
            this.logger.log(`[Payment] DEV MODE — mock verify OK for ${authority}`)
            return { refId: Math.floor(Math.random() * 9000000) + 1000000, success: true }
        }
        try {
            const response = await axios.post<ZarinpalApiResponse<ZarinpalVerifyResult>>(
                `${this.baseUrl}/verify.json`,
                { merchant_id: this.merchantId, amount, authority },
            )
            const { data } = response.data
            if (data.code !== 100 && data.code !== 101) {
                return { refId: 0, success: false }
            }
            return { refId: data.ref_id ?? 0, success: true }
        } catch (err) {
            this.logger.error('Zarinpal verify failed', err)
            return { refId: 0, success: false }
        }
    }
}
