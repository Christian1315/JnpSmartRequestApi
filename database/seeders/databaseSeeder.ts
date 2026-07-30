//database/seeders/databaseSeeders.ts
import { SeedRoles } from "./rolesSeeder";
import { SeedPermissions } from "./permissionsSeeder";
import { SeedTools } from "./toolsSeeder";
import { UserSeeders } from "./userSeeder";
import { PrismaService } from "../../prisma/prisma.service";

const seedDatabase = async () => {
    const prisma = new PrismaService();

    try {
        // Ordre important : les rôles doivent exister avant les users
        await new SeedRoles(prisma).init();
        await new SeedPermissions(prisma).init();
        await new SeedTools(prisma).init();
        await new UserSeeders(prisma).init();

        console.log('Seeding de data effectué avec succès.');
    } catch (error) {
        console.error('Erreur lors du seeding de la base de données:', error);
    } finally {
        await prisma.$disconnect();
    }
};

seedDatabase();