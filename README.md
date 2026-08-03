
## Description

JnpSmartRequestApi, est un api conçue pour la gestion des
des demandes (requetes) à l'interne de JNP
Cet API communique avec à la fois avec le front en NuxtJs
un module Odooo et une Intélligence Artificielle

Il est conçu avec du NestJS , le frameword de NodeJs

## Technologie utilisées:
__NodeJS
__NestJS
__Prisma

## Demarrage
git clone https://github.com/Christian1315/JnpSmartRequestApi.git .
cd JnpSmartRequestApi

__Créer une base de données 
__Copier le fichier .env.example
__Modifier le en .env
__Configurer selon vos choix, la DB et et les clés
__Utiliser de preference une DB postgres
__Bésoin de changer?: aller dans prisma.prisma, puis mettez mysql en lieu et place de postgres. Ensuite allez dans prisma.migration.lock et faites de meme

## Command

```bash
$ npm install
```

```bash
$ npx prisma generate
```

```bash
$ npx prisma migrate dev --name (le nom de la migration)
```

## Database seeding (pour pre remplir la base de données avec des données elementaires)
```bash
$ npm run seed
```


## Demmarage du projet

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Accès au projet
localhost:3000
