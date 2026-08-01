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
import { CreateStatutDto } from './dto/create-statut-dto';
import { StatutService } from './statut.service';
import { Request } from 'express';

@Controller("statuts")
export class StatutController {
    constructor(private readonly statutService: StatutService) {}

    // Get all statuts
    @Get("")
    getAllStatuts() {
        return this.statutService.getAllStatuts();
    }

    // Retrieve Statut via :id
    @Get('/:id')
    retrieveStatut(@Param('id', ParseIntPipe) id: number) {
        return this.statutService.getOneStatut(id);
    }

    // Create Statut
    @Post('')
    createStatut(@Req() req: Request ,@Body() data: CreateStatutDto) {
        return this.statutService.createStatut(req, data);
    }

    // Update Statut
    @Put('/:id')
    updateStatut(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @Body() data: CreateStatutDto,
    ) {
        return this.statutService.updateStatut(req, id, data);
    }

    // Delete Statut
    @Delete('/:id')
    deleteStatut(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.statutService.deleteStatut(req, id);
    }
}