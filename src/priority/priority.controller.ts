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
import { CreatePriorityDto } from './dto/create-priority-dto';
import { PriorityService } from './priority.service';
import { Request } from 'express';

@Controller("priorities")
export class PriorityController {
    constructor(private readonly priorityService: PriorityService) {}

    // Get all priorities
    @Get("")
    getAllPriorities() {
        return this.priorityService.getAllPriorities();
    }

    // Retrieve Prioritie via :id
    @Get('/:id')
    retrievePrioritie(@Param('id', ParseIntPipe) id: number) {
        return this.priorityService.getOnePrioritie(id);
    }

    // Create Prioritie
    @Post('')
    createPrioritie(@Req() req: Request ,@Body() data: CreatePriorityDto) {
        return this.priorityService.createPrioritie(req, data);
    }

    // Update Prioritie
    @Put('/:id')
    updatePrioritie(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreatePriorityDto,
    ) {
        return this.priorityService.updatePrioritie(req, id, data);
    }

    // Delete Prioritie
    @Delete('/:id')
    deletePrioritie(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.priorityService.deletePrioritie(req, id);
    }
}