import { DataSource, LessThan, Not, Repository } from 'typeorm';
import { NewSession, SessionAudience, SessionRecord, SessionRepository } from '@tiktok/auth';
import { Session } from '../entities/Session';

/** Roughly 1 in 50 sign-ins prunes sessions past their absolute expiry. */
const PURGE_PROBABILITY = 0.02;

function toRecord(entity: Session): SessionRecord {
  return {
    id: entity.id,
    userId: entity.userId,
    audience: entity.audience as SessionAudience,
    expiresAt: entity.expiresAt,
    lastSeenAt: entity.lastSeenAt,
  };
}

export class TypeOrmSessionRepository implements SessionRepository {
  private readonly repo: Repository<Session>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(Session);
  }

  async create(session: NewSession): Promise<SessionRecord> {
    const saved = await this.repo.save(this.repo.create(session));
    if (Math.random() < PURGE_PROBABILITY) {
      await this.repo.delete({ expiresAt: LessThan(new Date()) });
    }
    return toRecord(saved);
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const session = await this.repo.findOne({ where: { tokenHash } });
    return session ? toRecord(session) : null;
  }

  async touch(id: string, lastSeenAt: Date): Promise<void> {
    await this.repo.update({ id }, { lastSeenAt });
  }

  async deleteById(id: string): Promise<void> {
    await this.repo.delete({ id });
  }

  async deleteAllForUser(userId: string, options: { exceptId?: string } = {}): Promise<void> {
    await this.repo.delete(
      options.exceptId ? { userId, id: Not(options.exceptId) } : { userId }
    );
  }
}
