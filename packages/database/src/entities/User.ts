import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Relation,
} from 'typeorm';
import { UserRole } from '@tiktok/types';
import { Category } from './Category';
import { Product } from './Product';

// Case-insensitive unique indexes live in migrations/001_auth_hardening.sql.
// `synchronize: false` stops TypeORM schema sync from dropping them.
@Index('UQ_users_email_lower', { synchronize: false })
@Index('UQ_users_creatorHandle_lower', { synchronize: false })
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Null for accounts that only sign in with TikTok. */
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 255 })
  displayName!: string;

  /** Null for VIEWER accounts, which have no storefront. */
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  creatorHandle!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  tiktokOpenId!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tiktokUsername!: string | null;

  @Column({ type: 'text', nullable: true })
  tiktokAvatarUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  tiktokShopUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  avatarUrl!: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CREATOR,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Category, (category) => category.creator)
  categories?: Relation<Category>[];

  @OneToMany(() => Product, (product) => product.creator)
  products?: Relation<Product>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
