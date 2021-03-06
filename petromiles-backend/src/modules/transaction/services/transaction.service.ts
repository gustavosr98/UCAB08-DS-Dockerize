import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Repository } from 'typeorm';

// SERVICES
import { PlatformInterestService } from '@/modules/management/services/platform-interest.service';
import { PointsConversionService } from '@/modules/management/services/points-conversion.service';
import { ThirdPartyInterestService } from '@/modules/management/services/third-party-interest.service';
import { TransactionInterestService } from '@/modules/transaction/services/transaction-interest.service';
import { StateTransactionService } from '@/modules/transaction/services/state-transaction.service';

// ENTITIES
import { ClientBankAccount } from '@/entities/client-bank-account.entity';
import { Transaction } from '@/entities/transaction.entity';
import { Suscription } from '@/entities/suscription.entity';

// INTERFACES
import { PlatformInterest } from '@/enums/platform-interest.enum';
import { TransactionType } from '@/enums/transaction.enum';
import { StateName, StateDescription } from '@/enums/state.enum';
import { ApiModules } from '@/logger/api-modules.enum';
import { PaymentProvider } from '@/enums/payment-provider.enum';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private platformInterestService: PlatformInterestService,
    private pointsConversionService: PointsConversionService,
    private thirdPartyInterestService: ThirdPartyInterestService,
    private transactionInterestService: TransactionInterestService,
    private stateTransactionService: StateTransactionService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getAllFiltered(
    stateNames: StateName[],
    transactionsTypes: TransactionType[],
    paymentProviders: PaymentProvider[],
    idClientBankAccount?: number,
    isVerification?: boolean,
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = await this.transactionRepository.query(
      `
      SELECT 
        TRANSACTION.*, CLIENT_BANK_ACCOUNT.fk_user_client AS "idUserClient"
      FROM
        TRANSACTION, STATE_TRANSACTION, STATE, CLIENT_BANK_ACCOUNT
      WHERE
        -- relations
        STATE_TRANSACTION."fk_transaction" = TRANSACTION."idTransaction"
        AND STATE_TRANSACTION."fk_state" = STATE."idState"
        AND TRANSACTION."fk_client_bank_account" = CLIENT_BANK_ACCOUNT."idClientBankAccount"
        -- conditions
        AND STATE_TRANSACTION."finalDate" IS NULL
        AND STATE.name = ANY($1)
        AND TRANSACTION."paymentProviderTransactionId" IS ${
          isVerification ? '' : 'NOT'
        } NULL
        AND TRANSACTION."type" = ANY($2)
        ${
          !idClientBankAccount
            ? ''
            : `AND CLIENT_BANK_ACCOUNT."idClientBankAccount" = ${idClientBankAccount}`
        }
        AND CLIENT_BANK_ACCOUNT."paymentProvider" = ANY($3);
    `,
      [stateNames, transactionsTypes, paymentProviders],
    );

    return transactions;
  }

  async getTransactionInterests(options: App.Transaction.TransactionInterests) {
    const interest = await this.platformInterestService.getInterestByName(
      options.platformInterestType,
    );

    const extraPoints = options.platformInterestExtraPointsType
      ? await this.platformInterestService.getInterestByName(
          options.platformInterestExtraPointsType,
        )
      : null;

    const pointsConversion = await this.pointsConversionService.getRecentPointsConversion();

    const thirdPartyInterest = await this.thirdPartyInterestService.getCurrentInterest(
      options.thirdPartyInterestType,
    );
    return {
      interest,
      extraPoints,
      pointsConversion,
      thirdPartyInterest,
    };
  }

  async getTransactions(email: string) {
    const transactions = await this.transactionRepository.find({
      where: `userClient.email = '${email}' AND stateTransaction.finalDate is null AND trans.transaction is null`,
      join: {
        alias: 'trans',
        innerJoinAndSelect: {
          clientBankAccount: 'trans.clientBankAccount',
          stateTransaction: 'trans.stateTransaction',
          state: 'stateTransaction.state',
          transactionInterest: 'trans.transactionInterest',
          platformInterest: 'transactionInterest.platformInterest',
          userClient: 'clientBankAccount.userClient',
        },
      },
    });

    return transactions;
  }

  async get(
    idTransaction: number,
  ): Promise<App.Transaction.TransactionInformation> {
    const transaction = await this.transactionRepository.findOne(idTransaction);
    const state = transaction.stateTransaction.find(state => !state.finalDate)
      .state.name;

    let details;

    if (transaction.type == TransactionType.BANK_ACCOUNT_VALIDATION)
      details = this.getVerificationDetails(transaction);
    if (transaction.type == TransactionType.SUSCRIPTION_PAYMENT)
      details = this.getSubscriptionDetails(transaction);
    if (transaction.type == TransactionType.DEPOSIT)
      details = this.getDepositDetails(transaction);
    if (transaction.type == TransactionType.WITHDRAWAL)
      details = this.getWithdrawalDetails(transaction);

    return {
      id: transaction.idTransaction,
      date: transaction.initialDate.toLocaleDateString(),
      type: transaction.type,
      bankAccount: transaction.clientBankAccount.bankAccount.accountNumber.substr(
        -4,
      ),
      pointsConversion: 1 / transaction.pointsConversion.onePointEqualsDollars,
      ...details,
      state,
    };
  }

  private getVerificationDetails(transaction: Transaction) {
    const verificationInterest =
      parseFloat(transaction.transactionInterest[0].platformInterest.amount) /
      100;

    return {
      amount: verificationInterest,
      interest: 0,
      total: verificationInterest,
    };
  }

  private getSubscriptionDetails(transaction: Transaction) {
    const subscriptionCost = transaction.totalAmountWithInterest / 100;
    return {
      amount: subscriptionCost,
      interest: 0,
      total: subscriptionCost,
    };
  }

  private getDepositDetails(transaction: Transaction) {
    const amount = parseFloat((transaction.rawAmount / 100).toFixed(2));
    const interest = parseFloat(
      (transaction.totalAmountWithInterest / 100).toFixed(2),
    );
    const total = amount + interest;
    const pointsEquivalent =
      amount / transaction.pointsConversion.onePointEqualsDollars;
    return { amount, interest, total, pointsEquivalent };
  }

  private getWithdrawalDetails(transaction: Transaction) {
    const amount = parseFloat((transaction.rawAmount / 100).toFixed(2));
    const interest = parseFloat(
      (transaction.totalAmountWithInterest / 100).toFixed(2),
    );
    const total = amount + interest;
    const pointsEquivalent =
      amount / transaction.pointsConversion.onePointEqualsDollars;
    return { amount, interest, total, pointsEquivalent };
  }

  async createTransaction(
    options: App.Transaction.TransactionCreation,
  ): Promise<Transaction> {
    const transaction: Transaction = await this.transactionRepository.save(
      options,
    );

    await this.stateTransactionService.createStateTransaction(
      transaction,
      options.stateTransactionDescription,
      StateName.VERIFYING,
    );

    await this.transactionInterestService.createTransactionInterest(
      transaction,
      options.thirdPartyInterest,
      options.platformInterest,
      options.promotion,
      options.platformInterestExtraPoints,
    );

    this.logger.silly(
      `[${ApiModules.TRANSACTION}] Transaction ID: ${transaction.idTransaction} was created`,
    );
    return transaction;
  }

  async getClientBankAccountTransaction(clientBankAccount) {
    return await this.transactionRepository.find({ clientBankAccount });
  }

  // BANK ACCOUNT VERIFICATION TRANSACTION

  private generateRandomAmounts(
    amount: number,
    paymentProviderInterest: number,
  ) {
    const max = amount - paymentProviderInterest;
    const baseRandomAmount = Number(
      (
        Math.random() * (max - paymentProviderInterest) +
        paymentProviderInterest
      ).toFixed(0),
    );
    const randomAmount = Number((amount - baseRandomAmount).toFixed(0));
    return [baseRandomAmount, randomAmount];
  }

  async createVerificationTransaction(clientBankAccount: ClientBankAccount) {
    this.logger.verbose(
      `[${ApiModules.TRANSACTION}] Creating bank account verification transactions`,
    );

    const options = await this.getTransactionInterests({
      platformInterestType: PlatformInterest.VERIFICATION,
      platformInterestExtraPointsType: null,
      thirdPartyInterestType: PaymentProvider.STRIPE,
    });

    const randomAmounts = this.generateRandomAmounts(
      parseInt(options.interest.amount),
      options.thirdPartyInterest.amountDollarCents,
    );

    this.logger.verbose(
      `[${ApiModules.TRANSACTION}] id: ${
        clientBankAccount.idClientBankAccount
      } | last4: ${clientBankAccount.bankAccount.accountNumber.substr(
        -4,
      )} Random amounts for each transaction are: [${randomAmounts[0] /
        100}, ${randomAmounts[1] / 100}]`,
    );

    let verificationTransaction: Transaction = null;
    for (let i = 0; i < randomAmounts.length; i++) {
      verificationTransaction = await this.createTransaction({
        totalAmountWithInterest: randomAmounts[i],
        transaction: verificationTransaction,
        rawAmount: 0,
        type: TransactionType.BANK_ACCOUNT_VALIDATION,
        pointsConversion: options.pointsConversion,
        clientBankAccount: clientBankAccount,
        thirdPartyInterest: options.thirdPartyInterest,
        platformInterest: options.interest,
        stateTransactionDescription:
          StateDescription.VERIFICATION_TRANSACTION_CREATION,
      });
    }
  }

  // TRANSACTION TO UPGRADE TO PREMIUM

  async createUpgradeSuscriptionTransaction(
    clientBankAccount: ClientBankAccount,
    suscription: Suscription,
    paymentProviderTransactionId: string,
  ): Promise<Transaction> {
    const options = await this.getTransactionInterests({
      platformInterestType: PlatformInterest.PREMIUM_EXTRA,
      platformInterestExtraPointsType: null,
      thirdPartyInterestType: PaymentProvider.STRIPE,
    });

    return await this.createTransaction({
      totalAmountWithInterest:
        suscription.cost + options.thirdPartyInterest.amountDollarCents,
      rawAmount: 0,
      type: TransactionType.SUSCRIPTION_PAYMENT,
      pointsConversion: options.pointsConversion,
      clientBankAccount: clientBankAccount,
      thirdPartyInterest: options.thirdPartyInterest,
      platformInterest: options.interest,
      stateTransactionDescription: StateDescription.SUSCRIPTION_UPGRADE,
      paymentProviderTransactionId,
    });
  }

  //POINT PURCHASE TRANSACTION
  async createDeposit(
    clientBankAccount: ClientBankAccount,
    extraPointsType: PlatformInterest,
    amount: number,
    paymentProviderTransactionId: string,
  ): Promise<Transaction> {
    const options = await this.getTransactionInterests({
      platformInterestType: PlatformInterest.BUY,
      platformInterestExtraPointsType: extraPointsType,
      thirdPartyInterestType: PaymentProvider.STRIPE,
    });

    return await this.createTransaction({
      totalAmountWithInterest:
        options.thirdPartyInterest.amountDollarCents +
        parseFloat(options.interest.percentage) * amount,
      rawAmount: this.calculateExtraPoints(options.extraPoints, amount),
      type: TransactionType.DEPOSIT,
      pointsConversion: options.pointsConversion,
      clientBankAccount,
      thirdPartyInterest: options.thirdPartyInterest,
      platformInterest: options.interest,
      stateTransactionDescription: StateDescription.DEPOSIT,
      platformInterestExtraPoints: options.extraPoints,
      operation: 1,
      paymentProviderTransactionId,
    });
  }

  private calculateExtraPoints(extraPoints, amount: number) {
    if (!extraPoints) return amount;
    const extra = 1 + parseFloat(extraPoints.percentage);

    if (extraPoints.name === PlatformInterest.PREMIUM_EXTRA)
      return extra * amount;

    if (extraPoints.name === PlatformInterest.GOLD_EXTRA) {
      return amount * extra + parseFloat(extraPoints.amount);
    }
  }

  // WITHDRAWAL TRANSACTION
  async createWithdrawalTransaction(
    clientBankAccount: ClientBankAccount,
    amount: number,
  ): Promise<Transaction> {
    const options = await this.getTransactionInterests({
      platformInterestType: PlatformInterest.WITHDRAWAL,
      platformInterestExtraPointsType: null,
      thirdPartyInterestType: PaymentProvider.STRIPE,
    });

    return await this.createTransaction({
      totalAmountWithInterest:
        options.thirdPartyInterest.amountDollarCents +
        parseFloat(options.interest.percentage) * amount,
      rawAmount: amount,
      type: TransactionType.WITHDRAWAL,
      pointsConversion: options.pointsConversion,
      clientBankAccount,
      thirdPartyInterest: options.thirdPartyInterest,
      platformInterest: options.interest,
      stateTransactionDescription: StateDescription.WITHDRAWAL,
      operation: -1,
    });
  }
}
