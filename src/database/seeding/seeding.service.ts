import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Organisation } from '../../modules/organisations/entities/organisations.entity';
import { Regions } from '../../modules/regions/entities/region.entity';

@Injectable()
export class SeedingService {
  constructor(private readonly dataSource: DataSource) {}

  async seedDatabase() {
    const userRepository = this.dataSource.getRepository(User);
    const organisationRepository = this.dataSource.getRepository(Organisation);
    const regionsRepository = this.dataSource.getRepository(Regions);

    try {
      // Seed Users
      const existingUsers = await userRepository.count();
      if (existingUsers > 0) {
        Logger.log('Database is already populated. Skipping user seeding.');
      } else {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const u1 = userRepository.create({
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@example.com',
            password: 'password',
          });
          const u2 = userRepository.create({
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane.smith@example.com',
            password: 'password',
          });

          await userRepository.save([u1, u2]);

          const savedUsers = await userRepository.find();
          if (savedUsers.length !== 2) {
            throw new Error('Failed to create all users');
          }

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('User seeding failed:', error.message);
        } finally {
          await queryRunner.release();
        }
      }

      // Seed Regions
      const existingRegions = await regionsRepository.count();
      if (existingRegions === 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
          const regions = [
            {
              regionCode: 'NA',
              regionName: 'North America',
              countryCode: 'US',
              status: 1,
              createdOn: new Date(),
              createdBy: 'admin',
              modifiedOn: new Date(),
              modifiedBy: 'admin',
            },
            {
              regionCode: 'EU',
              regionName: 'Europe',
              countryCode: 'EU',
              status: 1,
              createdOn: new Date(),
              createdBy: 'admin',
              modifiedOn: new Date(),
              modifiedBy: 'admin',
            },
            {
              regionCode: 'AS',
              regionName: 'Asia',
              countryCode: 'AS',
              status: 1,
              createdOn: new Date(),
              createdBy: 'admin',
              modifiedOn: new Date(),
              modifiedBy: 'admin',
            },
            {
              regionCode: 'AF',
              regionName: 'Africa',
              countryCode: 'AF',
              status: 1,
              createdOn: new Date(),
              createdBy: 'admin',
              modifiedOn: new Date(),
              modifiedBy: 'admin',
            },
          ];

          await regionsRepository.save(regions);

          const savedRegions = await regionsRepository.find();
          if (savedRegions.length !== regions.length) {
            throw new Error('Failed to create all regions');
          }

          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('Region seeding failed:', error.message);
        } finally {
          await queryRunner.release();
        }

        // Seed Organisations
        const savedUsers = await userRepository.find(); // Fetch saved users again

        const or1 = organisationRepository.create({
          name: 'Org 1',
          description: 'Description 1',
          email: 'test1@email.com',
          industry: 'industry1',
          type: 'type1',
          country: 'country1',
          state: 'state1',
          address: 'address1',
          owner: savedUsers[0],
          creator: savedUsers[0],
          isDeleted: false,
        });

        const or2 = organisationRepository.create({
          name: 'Org 2',
          description: 'Description 2',
          email: 'test2@email.com',
          industry: 'industry2',
          type: 'type2',
          country: 'country2',
          state: 'state2',
          address: 'address2',
          owner: savedUsers[0],
          creator: savedUsers[0],
          isDeleted: false,
        });

        try {
          await organisationRepository.save([or1, or2]);

          const savedOrganisations = await organisationRepository.find();
          if (savedOrganisations.length !== 2) {
            throw new Error('Failed to create all organisations');
          }
        } catch (error) {
          console.error('Organisation seeding failed:', error.message);
        }
      } else {
        Logger.log('Regions are already seeded.');
      }
    } catch (error) {
      console.error('Error while checking for existing data:', error.message);
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return this.dataSource.getRepository(User).find({ relations: ['organisations'] });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }
  }
}
