import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  validateBalance?: boolean;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    validateBalance = true,
  }: Request): Promise<Transaction> {
    //  find the category
    const categoryCreateService = new CreateCategoryService();

    const foundCategory = await categoryCreateService.execute({
      title: category,
    });

    const transactionRepository = getCustomRepository(TransactionsRepository);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category: foundCategory,
    });

    const balance = await transactionRepository.getBalance();
    const operationResult = balance.total - value;
    if (type === 'outcome' && operationResult < 0 && validateBalance) {
      throw new AppError('insufficient funds', 400);
    }

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
