import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Relation,
} from 'typeorm';
import { ProductType } from '@tiktok/types';
import { User } from './User';
import { Category } from './Category';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => User, (user) => user.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator?: Relation<User>;

  @Column({ type: 'uuid' })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'categoryId' })
  category?: Relation<Category>;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Column({ type: 'text' })
  imageUrl!: string;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.TIKTOK_SHOP,
  })
  productType!: ProductType;

  @Column({ type: 'text' })
  tiktokProductUrl!: string;

  @Column({ type: 'text', nullable: true })
  tiktokVideoUrl?: string;

  @Column({ type: 'int', default: 0 })
  clickCount!: number;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
