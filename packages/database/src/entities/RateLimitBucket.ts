import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('rate_limit_buckets')
export class RateLimitBucket {
  /** SHA-256 of the logical key, so emails and IPs are not stored in clear text. */
  @PrimaryColumn({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'int' })
  count!: number;

  @Column({ type: 'timestamptz' })
  windowStart!: Date;
}
