import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './Product';
import { User } from './User';

@Entity('click_trackings')
export class ClickTracking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  productId!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product?: Product;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @Column({ type: 'uuid', nullable: true })
  viewerUserId?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'viewerUserId' })
  viewerUser?: User;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
