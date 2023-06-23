import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../src/services/prisma.service';
import { UnitTypeService } from '../../../src/services/unit-type.service';
import { UnitTypeCreate } from '../../../src/dtos/unit-types/unit-type-create.dto';
import { UnitTypeUpdate } from '../../../src/dtos/unit-types/unit-type-update.dto';
import { randomUUID } from 'crypto';
import { unitTypeArray } from '../../../prisma/seed-helpers/unit-type-factory';

describe('Testing unit type service', () => {
  let service: UnitTypeService;
  let prisma: PrismaService;

  const mockUnitType = (position: number, date: Date) => {
    return {
      id: randomUUID(),
      name: unitTypeArray[position].name,
      createdAt: date,
      updatedAt: date,
      numBedrooms: position,
    };
  };

  const mockUnitTypeSet = (numberToCreate: number, date: Date) => {
    const toReturn = [];
    for (let i = 0; i < numberToCreate; i++) {
      toReturn.push(mockUnitType(i, date));
    }
    return toReturn;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UnitTypeService, PrismaService],
    }).compile();

    service = module.get<UnitTypeService>(UnitTypeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('testing list()', async () => {
    const date = new Date();
    const mockedValue = mockUnitTypeSet(3, date);
    prisma.unitTypes.findMany = jest.fn().mockResolvedValue(mockedValue);

    expect(await service.list()).toEqual([
      {
        id: mockedValue[0].id,
        name: unitTypeArray[0].name,
        createdAt: date,
        updatedAt: date,
        numBedrooms: 0,
      },
      {
        id: mockedValue[1].id,
        name: unitTypeArray[1].name,
        createdAt: date,
        updatedAt: date,
        numBedrooms: 1,
      },
      {
        id: mockedValue[2].id,
        name: unitTypeArray[2].name,
        createdAt: date,
        updatedAt: date,
        numBedrooms: 2,
      },
    ]);

    expect(prisma.unitTypes.findMany).toHaveBeenCalled();
  });

  it('testing findOne() with id present', async () => {
    const date = new Date();
    const mockedValue = mockUnitType(3, date);
    prisma.unitTypes.findFirst = jest.fn().mockResolvedValue(mockedValue);

    expect(await service.findOne('example Id')).toEqual({
      id: mockedValue.id,
      name: unitTypeArray[3].name,
      createdAt: date,
      updatedAt: date,
      numBedrooms: 3,
    });

    expect(prisma.unitTypes.findFirst).toHaveBeenCalledWith({
      where: {
        id: {
          equals: 'example Id',
        },
      },
    });
  });

  it('testing findOne() with id not present', async () => {
    prisma.unitTypes.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      async () => await service.findOne('example Id'),
    ).rejects.toThrowError();

    expect(prisma.unitTypes.findFirst).toHaveBeenCalledWith({
      where: {
        id: {
          equals: 'example Id',
        },
      },
    });
  });

  it('testing create()', async () => {
    const date = new Date();
    const mockedValue = mockUnitType(3, date);
    prisma.unitTypes.create = jest.fn().mockResolvedValue(mockedValue);

    const params: UnitTypeCreate = {
      numBedrooms: 3,
      name: unitTypeArray[3].name,
    };

    expect(await service.create(params)).toEqual({
      id: mockedValue.id,
      name: unitTypeArray[3].name,
      createdAt: date,
      updatedAt: date,
      numBedrooms: 3,
    });

    expect(prisma.unitTypes.create).toHaveBeenCalledWith({
      data: {
        name: unitTypeArray[3].name,
        numBedrooms: 3,
      },
    });
  });

  it('testing update() existing record found', async () => {
    const date = new Date();

    const mockedUnitType = mockUnitType(3, date);

    prisma.unitTypes.findFirst = jest.fn().mockResolvedValue(mockedUnitType);
    prisma.unitTypes.update = jest.fn().mockResolvedValue({
      ...mockedUnitType,
      name: unitTypeArray[4].name,
      numBedrooms: 4,
    });

    const params: UnitTypeUpdate = {
      numBedrooms: 4,
      name: unitTypeArray[4].name,
      id: mockedUnitType.id,
    };

    expect(await service.update(params)).toEqual({
      id: mockedUnitType.id,
      name: unitTypeArray[4].name,
      createdAt: date,
      updatedAt: date,
      numBedrooms: 4,
    });

    expect(prisma.unitTypes.findFirst).toHaveBeenCalledWith({
      where: {
        id: mockedUnitType.id,
      },
    });

    expect(prisma.unitTypes.update).toHaveBeenCalledWith({
      data: {
        name: unitTypeArray[4].name,
        numBedrooms: 4,
      },
      where: {
        id: mockedUnitType.id,
      },
    });
  });

  it('testing update() existing record not found', async () => {
    prisma.unitTypes.findFirst = jest.fn().mockResolvedValue(null);
    prisma.unitTypes.update = jest.fn().mockResolvedValue(null);

    const params: UnitTypeUpdate = {
      numBedrooms: 4,
      name: unitTypeArray[4].name,
      id: 'example id',
    };

    await expect(
      async () => await service.update(params),
    ).rejects.toThrowError();

    expect(prisma.unitTypes.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'example id',
      },
    });
  });

  it('testing delete()', async () => {
    const date = new Date();

    const mockedUnitType = mockUnitType(3, date);

    prisma.unitTypes.findFirst = jest.fn().mockResolvedValue(mockedUnitType);
    prisma.unitTypes.delete = jest.fn().mockResolvedValue(mockedUnitType);

    expect(await service.delete('example Id')).toEqual({
      success: true,
    });

    expect(prisma.unitTypes.delete).toHaveBeenCalledWith({
      where: {
        id: 'example Id',
      },
    });
  });
});
