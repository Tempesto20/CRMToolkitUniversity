// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// // import { CatsModule } from './cats/cats.module';

// @Module({
//   imports: [
//     TypeOrmModule.forRoot({
//       type: 'postgres',
//       host: 'localhost',
//       port: 5432,
//       username: 'postgres',
//       password: '1',
//       database: 'CRMToolkitUniversity',
//       entities: [__dirname + '/**/*.entity{.ts,.js}'],
//       // synchronize: true,
//       synchronize: false,
//     }),
//     // CatsModule,
//   ],
// })
// export class AppModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesController } from './employees/employees.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_username',
      password: 'your_password',
      database: 'CRMToolkitUniversity',
      entities: [],
      synchronize: false,
    }),
  ],
  controllers: [EmployeesController],
})
export class AppModule {}