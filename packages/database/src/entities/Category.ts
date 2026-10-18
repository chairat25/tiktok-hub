import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { User } from './User';
import type { Product } from './Product';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  creatorId!: string;

  @ManyToOne('User', (user: User) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator?: Relation<User>;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('Product', (product: Product) => product.category)
  products?: Relation<Product>[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
