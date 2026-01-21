import { Controller, Post, Get, Body, UploadedFile, UseInterceptors, ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryRunner, DataSource } from 'typeorm';

@Controller('employees')
export class EmployeesController {
  constructor(private dataSource: DataSource) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async createEmployee(
    @Body() body: any,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Проверяем, существует ли сотрудник с таким личным номером
      const existingEmployee = await queryRunner.query(
        'SELECT * FROM employees WHERE personal_number = $1',
        [body.personal_number]
      );

      if (existingEmployee.length > 0) {
        throw new ConflictException({
          error: 'Сотрудник с таким личным номером уже существует',
          existing: {
            full_name: existingEmployee[0].full_name,
            position: existingEmployee[0].position,
          },
        });
      }

      // Вставляем нового сотрудника
      const result = await queryRunner.query(
        `INSERT INTO employees (
          service_type_id, work_type_id, position, locomotive_id, 
          full_name, has_trip, has_craneman, diesel_access, electric_access,
          birthday, personal_number, brigada_id, phone,
          photo_filename, photo_mimetype, photo_path
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
        RETURNING *`,
        [
          body.service_type_id,
          body.work_type_id,
          body.position,
          body.locomotive_id || null,
          body.full_name,
          body.has_trip || false,
          body.has_craneman || false,
          body.diesel_access || false,
          body.electric_access || false,
          body.birthday || null,
          body.personal_number,
          body.brigada_id || null,
          body.phone || null,
          photo?.originalname || null,
          photo?.mimetype || null,
          photo ? `/uploads/employees/${Date.now()}_${photo.originalname}` : null,
        ]
      );

      // Здесь можно сохранить файл на диск, если нужно
      if (photo) {
        // Логика сохранения файла...
      }

      await queryRunner.commitTransaction();
      return { success: true, employee: result[0] };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Get('work-types/:serviceTypeId')
  async getWorkTypes(@Param('serviceTypeId') serviceTypeId: string) {
    let workTypeIds: number[];
    
    if (serviceTypeId === '1') {
      workTypeIds = [1, 2]; // Электровозная служба
    } else if (serviceTypeId === '2') {
      workTypeIds = [3, 4]; // Тепловозная служба
    } else {
      return [];
    }

    const result = await this.dataSource.query(
      'SELECT * FROM work_types WHERE work_type_id IN ($1, $2)',
      workTypeIds
    );
    
    return result;
  }

  @Get()
  async getAllEmployees() {
    const result = await this.dataSource.query(`
      SELECT e.*, 
             s.service_type_name,
             w.work_type_name,
             b.brigada_name,
             l.locomotive_name
      FROM employees e
      LEFT JOIN service_types s ON e.service_type_id = s.service_type_id
      LEFT JOIN work_types w ON e.work_type_id = w.work_type_id
      LEFT JOIN brigada b ON e.brigada_id = b.brigada_id
      LEFT JOIN locomotives l ON e.locomotive_id = l.locomotive_id
      ORDER BY e.full_name
    `);
    
    return result;
  }
}