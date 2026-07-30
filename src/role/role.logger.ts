import { Injectable, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class LoggerService {
    log(message:string){
        console.log(`[LOG] : ${message} `)
    }
}
