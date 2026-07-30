import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, Res } from '@nestjs/common';
import { CreateRoleDto } from "./dto/create-role-dto";
import { RoleService } from './role.service';
import { Request } from 'express';

@Controller('api/roles')
export class RoleController {
    constructor(private readonly roleService:RoleService) { }

    // Get roles
    @Get()
    getRoles() {
        return this.roleService.getAllRoles()
    }

    // Retrieve role via :id
    @Get(":id")
    retrieveUser(@Param("id",ParseIntPipe) id: number) {
        return this.roleService.getOneRole(id) 
    }

    // Create role
    @Post("create")
    createUser(@Req() req:Request, @Body() CreateRoleDto: CreateRoleDto) {
        return this.roleService.createRole(req, CreateRoleDto)
    }

    // Update role
    @Put(":id")
    updateRole(@Param("id",ParseIntPipe) id:number, @Body() CreateRoleDto: CreateRoleDto) {
        return this.roleService.updateRole(id,CreateRoleDto)
    }

    // delete User
    @Delete(":id")
    deleteUser(@Param("id",ParseIntPipe) id:number) {
        return this.roleService.deleteRole(id)
    }
}
