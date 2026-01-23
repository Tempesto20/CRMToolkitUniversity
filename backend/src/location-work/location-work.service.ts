import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationWork } from './location-work.entity';
import { CreateLocationWorkDto } from './dto/create-location-work.dto';
import { UpdateLocationWorkDto } from './dto/update-location-work.dto';

@Injectable()
export class LocationWorkService {
  constructor(
    @InjectRepository(LocationWork)
    private locationWorkRepository: Repository<LocationWork>,
  ) {}

  // Создать место работы
  async create(createLocationWorkDto: CreateLocationWorkDto): Promise<LocationWork> {
    const locationWork = this.locationWorkRepository.create(createLocationWorkDto);
    return await this.locationWorkRepository.save(locationWork);
  }

  // Получить все места работы
  async findAll(): Promise<LocationWork[]> {
    return await this.locationWorkRepository.find({
      order: { locationId: 'ASC' }
    });
  }

  // Получить место работы по ID
  async findOne(id: number): Promise<LocationWork> {
    const locationWork = await this.locationWorkRepository.findOne({
      where: { locationId: id },
      relations: ['locomotives']
    });
    
    if (!locationWork) {
      throw new NotFoundException(`Место работы с ID ${id} не найдено`);
    }
    
    return locationWork;
  }

  // Получить место работы по названию
  async findByName(name: string): Promise<LocationWork[]> {
    return await this.locationWorkRepository.find({
      where: { locationName: name },
      order: { locationId: 'ASC' }
    });
  }

  // Обновить место работы
  async update(id: number, updateLocationWorkDto: UpdateLocationWorkDto): Promise<LocationWork> {
    const locationWork = await this.findOne(id);
    
    if (updateLocationWorkDto.locationName) {
      locationWork.locationName = updateLocationWorkDto.locationName;
    }
    
    return await this.locationWorkRepository.save(locationWork);
  }

  // Удалить место работы
  async remove(id: number): Promise<void> {
    const locationWork = await this.locationWorkRepository.findOne({
      where: { locationId: id },
      relations: ['locomotives']
    });
    
    if (!locationWork) {
      throw new NotFoundException(`Место работы с ID ${id} не найдено`);
    }
    
    // Проверка на наличие привязанных локомотивов
    if (locationWork.locomotives && locationWork.locomotives.length > 0) {
      throw new ConflictException({
        message: 'Нельзя удалить место работы, к которому привязаны локомотивы',
        locomotivesCount: locationWork.locomotives.length,
      });
    }
    
    await this.locationWorkRepository.remove(locationWork);
  }

  // Получить места работы с количеством локомотивов
  async getLocationsWithStats(): Promise<any[]> {
    return await this.locationWorkRepository
      .createQueryBuilder('location')
      .leftJoin('location.locomotives', 'locomotive')
      .select([
        'location.locationId as locationId',
        'location.locationName as locationName',
        'COUNT(locomotive.locomotiveId) as locomotiveCount',
        'SUM(CASE WHEN locomotive.operational_status = true THEN 1 ELSE 0 END) as operationalCount',
        'SUM(CASE WHEN locomotive.locomotive_depo = true THEN 1 ELSE 0 END) as inDepotCount'
      ])
      .groupBy('location.locationId, location.locationName')
      .orderBy('location.locationName', 'ASC')
      .getRawMany();
  }

  // Получить популярные места работы (с наибольшим количеством локомотивов)
  async getPopularLocations(limit: number = 10): Promise<any[]> {
    return await this.locationWorkRepository
      .createQueryBuilder('location')
      .leftJoin('location.locomotives', 'locomotive')
      .select([
        'location.locationId as locationId',
        'location.locationName as locationName',
        'COUNT(locomotive.locomotiveId) as locomotiveCount'
      ])
      .groupBy('location.locationId, location.locationName')
      .orderBy('locomotiveCount', 'DESC')
      .addOrderBy('location.locationName', 'ASC')
      .limit(limit)
      .getRawMany();
  }
}