import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { NewUser, UserPatch, UserRecord, UserRepository, conflict } from '@tiktok/auth';
import { User } from '../entities/User';

const PG_UNIQUE_VIOLATION = '23505';

function toRecord(entity: User): UserRecord {
  return {
    id: entity.id,
    email: entity.email ?? null,
    displayName: entity.displayName,
    creatorHandle: entity.creatorHandle ?? null,
    passwordHash: entity.passwordHash ?? null,
    tiktokOpenId: entity.tiktokOpenId ?? null,
    tiktokUsername: entity.tiktokUsername ?? null,
    tiktokAvatarUrl: entity.tiktokAvatarUrl ?? null,
    tiktokShopUrl: entity.tiktokShopUrl ?? null,
    avatarUrl: entity.avatarUrl ?? null,
    role: entity.role,
    isActive: entity.isActive,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { code?: string }).code === PG_UNIQUE_VIOLATION
  );
}

async function translateUniqueViolation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error: unknown) {
    if (isUniqueViolation(error)) throw conflict('ข้อมูลนี้ถูกใช้งานแล้ว');
    throw error;
  }
}

export class TypeOrmUserRepository implements UserRepository {
  private readonly repo: Repository<User>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(User);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.repo.findOne({ where: { id } });
    return user ? toRecord(user) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.repo
      .createQueryBuilder('u')
      .where('LOWER(u.email) = LOWER(:email)', { email })
      .getOne();
    return user ? toRecord(user) : null;
  }

  /** Case-insensitive, so "@Pond" and "@pond" can never both exist. */
  async findByHandle(handle: string): Promise<UserRecord | null> {
    const user = await this.repo
      .createQueryBuilder('u')
      .where('LOWER(u.creatorHandle) = LOWER(:handle)', { handle })
      .getOne();
    return user ? toRecord(user) : null;
  }

  async findByTikTokOpenId(openId: string): Promise<UserRecord | null> {
    const user = await this.repo.findOne({ where: { tiktokOpenId: openId } });
    return user ? toRecord(user) : null;
  }

  async create(input: NewUser): Promise<UserRecord> {
    const entity = this.repo.create({ ...input, isActive: true });
    const saved = await translateUniqueViolation(() => this.repo.save(entity));
    return toRecord(saved);
  }

  async update(id: string, patch: UserPatch): Promise<UserRecord> {
    if (Object.keys(patch).length > 0) {
      await translateUniqueViolation(() => this.repo.update({ id }, patch));
    }
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error(`User ${id} disappeared during update`);
    return toRecord(updated);
  }
}
