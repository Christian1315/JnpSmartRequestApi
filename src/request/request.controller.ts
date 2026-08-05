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
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreateRequestDto } from './dto/create-request-dto';
import { RequestService } from './request.service';
import { Request } from 'express';

// Configuration réutilisable de Multer
const documentStorage = {
    storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${uniqueSuffix}${ext}`);
        },
    }),
    fileFilter: (req: any, file: Express.Multer.File, callback: any) => {
        const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.test(ext)) {
            callback(null, true);
        } else {
            callback(new BadRequestException('Type de fichier non autorisé (pdf, doc, docx, jpg, jpeg, png uniquement)'), false);
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo max
};

@Controller('requests')
export class RequestController {
    constructor(private readonly requestService: RequestService) {}

    // Get requests
    @Get()
    getRequests(@Req() req: Request) {
        return this.requestService.getAllRequests(req);
    }

    // Get requests by statut_id
    @Get("statuts/:statut_id")
    getRequestByStatus(@Param('statut_id', ParseIntPipe) statut_id: number) {
        return this.requestService.getAllRequestByStatus(statut_id);
    }

    // Retrieve request via :id
    @Get(':id')
    retrieveRequest(@Param('id', ParseIntPipe) id: number) {
        return this.requestService.getOneRequest(id);
    }

    // Create request
    @Post()
    @UseInterceptors(FileInterceptor('document', documentStorage))
    createRequest(
        @Req() req: Request,
        @UploadedFile() file: Express.Multer.File,
        @Body() data: CreateRequestDto,
    ) {
        return this.requestService.createRequest(req, data, file);
    }

    // Update request
    @Put(':id')
    @UseInterceptors(FileInterceptor('document', documentStorage))
    updateRequest(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() data: CreateRequestDto,
    ) {
        return this.requestService.updateRequest(req, id, data, file);
    }

    // delete request
    @Delete(':id')
    deleteRequest(@Req() req:Request, @Param('id', ParseIntPipe) id: number) {
        return this.requestService.deleteRequete(req,id);
    }
}