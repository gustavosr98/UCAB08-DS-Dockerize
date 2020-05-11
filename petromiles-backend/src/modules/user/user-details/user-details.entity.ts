import { UserClient } from '../../client/user-client/user-client.entity';
import { Language } from '../language/language.entity';
import { Country } from '../../management/country/country.entity';
import { BankAccount } from '../../bank-account/bank-account/bank-account.entity';
import { UserAdministrator } from '../user-administrator/user-administrator.entity';
import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class UserDetails extends BaseEntity {
  @PrimaryGeneratedColumn()
  idUserDetails: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  secondLastName?: string;

  @Column({ nullable: true })
  birthdate?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  /*FOTO DE QUE TIPO ES */
  @Column({ nullable: true })
  photo?: string;

  @OneToOne(
    type => UserClient,
    userClient => userClient.idUserClient,
    { nullable: true },
  )
  @JoinColumn({ name: 'fk_user_client' })
  userClient?: UserClient;

  @OneToOne(
    type => UserAdministrator,
    userAdministrator => userAdministrator.idUserAdministrator,
    { nullable: true },
  )
  @JoinColumn({ name: 'fk_user_administrator' })
  userAdministrator?: UserAdministrator;

  @ManyToOne(
    type => Language,
    language => language.idLanguage,
    { nullable: false },
  )
  @JoinColumn({ name: 'fk_language' })
  language: Language;

  @ManyToOne(
    type => Country,
    country => country.idCountry,
    { nullable: true },
  )
  @JoinColumn({ name: 'fk_country' })
  country: Country;

  @OneToMany(
    type => BankAccount,
    bankAccount => bankAccount.idBankAccount,
    { nullable: true },
  )
  bankAccount?: BankAccount;
}