import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-activities')
  @UseGuards(JwtAuthGuard)
  getRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }

  @Get('overview')
  @UseGuards(JwtAuthGuard)
  getOverview() {
    return this.dashboardService.getOverview();
  }

  // Public endpoint for dashboard stats (no auth required)
  @Get('public/stats')
  getPublicStats() {
    return this.dashboardService.getStats();
  }

  @Get('public/recent-activities')
  getPublicRecentActivities() {
    return this.dashboardService.getRecentActivities();
  }
}
