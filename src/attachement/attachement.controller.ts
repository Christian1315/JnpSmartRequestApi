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
import { CreateAttachementDto } from './dto/create-attachement-dto';
import { AttachementService } from './attachement.service';
import { Request } from 'express';

// Configuration réutilisable de Multer (identique à celle de request.controller.ts)
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

@Controller()
export class AttachementController {
    constructor(private readonly attachementService: AttachementService) {}

    // Get all attachements
    @Get("attachments")
    getAllAttachements() {
        return this.attachementService.getAllAttachements();
    }

    // Get attachements for a specific request
    @Get('requests/:requestId/attachments')
    getAttachementsByRequest(@Param('requestId', ParseIntPipe) requestId: number) {
        return this.attachementService.getAttachementsByRequest(requestId);
    }

    // Retrieve attachement via :id
    @Get('attachments/:id')
    retrieveAttachement(@Param('id', ParseIntPipe) id: number) {
        return this.attachementService.getOneAttachement(id);
    }

    // Create attachement
    @Post("requests/:id/attachments")
    @UseInterceptors(FileInterceptor('document', documentStorage))
    createAttachement(
        @Req() req: Request,
        @Param("id",ParseIntPipe) id:number,
        @Body() data: CreateAttachementDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.attachementService.createAttachement(req,id, data, file);
    }

    // Update attachement
    @Put('attachments/:id')
    @UseInterceptors(FileInterceptor('document', documentStorage))
    updateAttachement(
        @Req() req: Request,
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() data: CreateAttachementDto,
    ) {
        return this.attachementService.updateAttachement(req, id, data, file);
    }

    // Delete attachement
    @Delete('attachments/:id')
    deleteAttachement(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
        return this.attachementService.deleteAttachement(req, id);
    }
}