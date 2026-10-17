import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '@tiktok/types';
import { Category } from './Category';
import { Product } from './Product';

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

  @OneToMany(() => Category, (category) => category.creator)
  categories?: Category[];

  @OneToMany(() => Product, (product) => product.creator)
  products?: Product[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
