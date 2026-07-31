import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { CreateRoleDto } from "./dto/create-role-dto";
import { RoleService } from './role.service';
import { Request } from 'express';

@Controller('roles')
export class RoleController {
    constructor(private readonly roleService:RoleService) { }

    // Get roles
    @Get()
    getUsers() {
        return this.roleService.getAllRoles()
    }

    // Retrieve role via :id
    @Get(":id")
    retrieveRole(@Param("id",ParseIntPipe) id: number) {
        return this.roleService.getOneRole(id) 
    }

    // Create role
    @Post()
    createRole(@Req() req:Request, @Body() CreateRoleDto: CreateRoleDto) {
        return this.roleService.createRole(req,CreateRoleDto)
    }

    // Update role
    @Put(":id")
    updateRole(@Req() req:Request, @Param("id",ParseIntPipe) id:number, @Body() CreateRoleDto: CreateRoleDto) {
        return this.roleService.updateRole(req,id,CreateRoleDto)
    }

    // delete role
    @Delete(":id")
    deleteUser(@Req() req:Request,@Param("id",ParseIntPipe) id:number) {
        return this.roleService.deleteRole(req,id)
    }
}
