import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { CreatePermissionDto } from "./dto/create-permission-dto";
import { PermissionService } from './permission.service';
import { Request } from 'express';

@Controller('permissions')
export class PermissionController {
    constructor(private readonly permissionService:PermissionService) { }

    // Get permissions
    @Get()
    getUsers() {
        return this.permissionService.getAllPermissions()
    }

    // Retrieve permission via :id
    @Get(":id")
    retrievePermission(@Param("id",ParseIntPipe) id: number) {
        return this.permissionService.getOnePermission(id) 
    }

    // Create permission
    @Post()
    createPermission(@Req() req:Request, @Body() CreatePermissionDto: CreatePermissionDto) {
        return this.permissionService.createPermission(req,CreatePermissionDto)
    }

    // Update permission
    @Put(":id")
    updatePermission(@Req() req:Request, @Param("id",ParseIntPipe) id:number, @Body() CreatePermissionDto: CreatePermissionDto) {
        return this.permissionService.updatePermission(req,id,CreatePermissionDto)
    }

    // delete permission
    @Delete(":id")
    deleteUser(@Req() req:Request,@Param("id",ParseIntPipe) id:number) {
        return this.permissionService.deletePermission(req,id)
    }
}
