//category/category.logger.ts
import { Injectable, Param } from '@nestjs/common';

@Injectable()
export class LoggerService {
    log(message:string){
        console.log(`[LOG] : ${message} `)
    }
}
