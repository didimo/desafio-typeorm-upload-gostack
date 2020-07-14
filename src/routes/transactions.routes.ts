import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import CreateTransactionService from '../services/CreateTransactionService';

import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();
  return response.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const createTransactionService = new CreateTransactionService();
  try {
    const transaction = await createTransactionService.execute(request.body);

    return response.status(200).json(transaction);
  } catch (error) {
    return response
      .status(error.statusCode)
      .json({ message: error.message, status: 'error' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const deleteTransactionService = new DeleteTransactionService();
  try {
    await deleteTransactionService.execute({
      id: request.params.id,
    });

    return response
      .status(204)
      .json({ message: 'transaction removed successfully' });
  } catch (error) {
    return response.status(error.statusCode).json(error);
  }
});

transactionsRouter.post('/import', async (request, response) => {
  const importTransactionService = new ImportTransactionsService();
  try {
    const transactions = await importTransactionService.execute();

    return response.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    return response.status(error.statusCode).json(error);
  }
});

export default transactionsRouter;
