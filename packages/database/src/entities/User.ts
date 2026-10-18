import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  type Relation,
} from 'typeorm';
import { UserRole } from '@tiktok/types';
import type { Category } from './Category';
import type { Product } from './Product';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  displayName!: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  creatorHandle!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  tiktokOpenId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tiktokUsername?: string;

  @Column({ type: 'text', nullable: true })
  tiktokAvatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  tiktokShopUrl?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CREATOR,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('Category', (category: Category) => category.creator)
  categories?: Relation<Category>[];

  @OneToMany('Product', (product: Product) => product.creator)
  products?: Relation<Product>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
