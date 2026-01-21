import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brigada } from './brigada.entity';
import { CreateBrigadaDto } from './dto/create-brigada.dto';

@Injectable()
export class BrigadaService {
  constructor(
    @InjectRepository(Brigada)
    private brigadaRepository: Repository<Brigada>,
  ) {}

  async findAll(): Promise<Brigada[]> {
    return this.brigadaRepository.find({
      order: { brigadaId: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Brigada> {
    const brigada = await this.brigadaRepository.findOne({
      where: { brigadaId: id }
    });
    
    if (!brigada) {
      throw new NotFoundException(`Бригада с ID ${id} не найдена`);
    }
    
    return brigada;
  }

  async create(createBrigadaDto: CreateBrigadaDto): Promise<Brigada> {
    // Находим максимальный ID
    const maxId = await this.brigadaRepository
      .createQueryBuilder('brigada')
      .select('MAX(brigada.brigadaId)', 'max')
      .getRawOne();
    
    const newId = (maxId.max || 0) + 1;
    
    const brigada = this.brigadaRepository.create({
      brigadaId: newId,
      brigadaName: createBrigadaDto.brigadaName,
    });
    
    return this.brigadaRepository.save(brigada);
  }

  async remove(id: number): Promise<void> {
    const brigada = await this.findOne(id);
    await this.brigadaRepository.remove(brigada);
  }
}