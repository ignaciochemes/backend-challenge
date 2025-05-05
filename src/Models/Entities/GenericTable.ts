import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class GenericTable {
    @CreateDateColumn({ name: 'created_at' })
    public createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    public updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    public deletedAt: Date;
}