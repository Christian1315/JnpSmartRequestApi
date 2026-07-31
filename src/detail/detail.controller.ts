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
import { CreateDetailDto } from './dto/create-detail-dto';
import { DetailService } from './detail.service';
import { Request } from 'express';

@Controller()
export class DetailController {
    constructor(private readonly detailService: DetailService) {}

    // Get all details
    @Get("comments")
    getAllDetails() {
        return this.detailService.getAllDetails();
    }

    // Get details for a specific request
    @Get('requests/:id/comments')
    getDetailsByRequest(@Param('id', ParseIntPipe) id: number) {
        return this.detailService.getDetailsByRequest(id);
    }

    // Retrieve detail via :id
    @Get(':id')
    retrieveDetail(@Param('id', ParseIntPipe) id: number) {
        return this.detailService.getOneDetail(id);
    }

    // Create detail
    @Post('requests/:id/comments')
    createDetail(@Req() req: Request,@Param('id',ParseIntPipe) id:number ,@Body() data: CreateDetailDto) {
        return this.detailService.createDetail(req,id, data);
    }

    // Update detail
    @Put(':id')
    updateDetail(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateDetailDto,
    ) {
        return this.detailService.updateDetail(req, id, data);
    }

    // Delete detail
    @Delete(':id')
    deleteDetail(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.detailService.deleteDetail(req, id);
    }
}