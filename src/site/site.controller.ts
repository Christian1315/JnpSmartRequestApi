import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Req,
} from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site-dto';
import { SiteService } from './site.service';
import { Request } from 'express';

@Controller("sites")
export class SiteController {
    constructor(private readonly siteService: SiteService) {}

    // Get all sites
    @Get("")
    getAllSites() {
        return this.siteService.getAllSites();
    }

    // Retrieve site via :id
    @Get('/:id')
    retrieveSite(@Param('id', ParseIntPipe) id: number) {
        return this.siteService.getOneSite(id);
    }

    // Create site
    @Post('')
    createSite(@Req() req: Request ,@Body() data: CreateSiteDto) {
        return this.siteService.createSite(req, data);
    }

    // Update site
    @Put('/:id')
    updateSite(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateSiteDto,
    ) {
        return this.siteService.updateSite(req, id, data);
    }

    // Delete site
    @Delete('/:id')
    deleteSite(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.siteService.deleteSite(req, id);
    }
}