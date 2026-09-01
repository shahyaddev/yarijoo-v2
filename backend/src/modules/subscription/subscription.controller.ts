import { Controller, Get, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { SubscribeDto } from './dto/subscribe.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtUser } from '../auth/strategies/jwt.strategy'

@Controller('subscriptions')
export class SubscriptionController {
    constructor(private subscriptionService: SubscriptionService) { }

    @Get('plans')
    getPlans() {
        return this.subscriptionService.getPlans()
    }

    @Get('current')
    @UseGuards(JwtAuthGuard)
    getCurrent(@CurrentUser() user: JwtUser) {
        return this.subscriptionService.getCurrentSubscription(user.sub)
    }

    @Post('subscribe')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    subscribe(@CurrentUser() user: JwtUser, @Body() dto: SubscribeDto) {
        return this.subscriptionService.subscribe(user.sub, dto.plan, dto.period)
    }

    @Post('cancel')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    cancel(@CurrentUser() user: JwtUser) {
        return this.subscriptionService.cancel(user.sub)
    }
}
