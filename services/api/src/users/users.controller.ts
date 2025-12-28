import { Controller, Get, Patch, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserSettingsDto, UpdateUserSettingsDto } from '@repo/api-types';

@ApiTags('users')
@ApiBearerAuth()
@Controller('me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get current user settings' })
  @ApiResponse({ status: 200, type: UserSettingsDto })
  async getSettings(@Req() req: any): Promise<UserSettingsDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.getSettings(userId);
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update current user settings' })
  @ApiResponse({ status: 200, type: UserSettingsDto })
  async updateSettings(
    @Req() req: any,
    @Body() updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettingsDto> {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.usersService.updateSettings(userId, updateDto);
  }
}
