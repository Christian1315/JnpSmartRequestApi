import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthLoggerService {
    log(message:string){
        console.log(`[LOG] : ${message} `)
    }
}
