import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const initialIncome = 0;
    const inicitalOutcome = 0;
    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((previous, current) => {
        return previous + parseFloat((current.value as unknown) as string);
      }, initialIncome);

    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((previous, current) => {
        return previous + parseFloat((current.value as unknown) as string);
      }, inicitalOutcome);

    return { income, outcome, total: income - outcome };
  }
}

export default TransactionsRepository;
