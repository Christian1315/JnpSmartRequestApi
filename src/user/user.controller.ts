import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { CreateUserDto } from "./dto/create-user-dto";
import { UpdateUserDto } from './dto/update-user-dto'; 
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('users')
export class UserController {
    constructor(private readonly userService:UserService) { }

    // Get users
    @Get()
    getUsers() {
        return this.userService.getAllUsers()
    }

    // Retrieve user via :id
    @Get(":id")
    retrieveUser(@Param("id",ParseIntPipe) id: number) {
        return this.userService.getOneUser(id) 
    }

    // Create user
    @Post()
    createUser(@Req() req:Request, @Body() CreateUserDto: CreateUserDto) {
        return this.userService.createUser(req,CreateUserDto)
    }

    // Update user
    @Put(":id")
    updateUser(@Req() req:Request, @Param("id",ParseIntPipe) id:number, @Body() UpdateUserDto: UpdateUserDto) {
        return this.userService.updateUser(req,id,UpdateUserDto)
    }

    // delete User
    @Delete(":id")
    deleteUser(@Param("id",ParseIntPipe) id:number) {
        return this.userService.deleteUser(id)
    }
}
