import {
    Controller,
    Get,
    Post,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { MigrationService } from './migration.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Controller('admin/migration')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MigrationController {
    constructor(private readonly migrationService: MigrationService) { }

    @Get('status')
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    getStatus() {
        return this.migrationService.getMigrationStatus()
    }

    @Post('run')
    @Roles(UserRole.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    runMigration() {
        return this.migrationService.runMigration()
    }
}
