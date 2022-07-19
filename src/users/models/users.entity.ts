import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UsersEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Column({default:''})
    name: string;

    @Column({default:''})
    email: string;

}