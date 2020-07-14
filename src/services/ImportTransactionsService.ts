import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransaction from './CreateTransactionService';
import CreateCategory from './CreateCategoryService';
import Category from '../models/Category';

interface Line {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  validateBalance: boolean;
}

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      'transactions.csv',
    );

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: Array<string>[] = [];

    const createTransactionService = new CreateTransaction();
    const createCategoryService = new CreateCategory();

    const categories: Array<string> = [];

    parseCSV.on('data', line => {
      const findCategory = categories.find(caregory => caregory === line[3]);
      if (!findCategory) {
        categories.push(line[3]);
      }
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesPromises: Array<Promise<Category>> = [];

    categories.map(title => {
      categoriesPromises.push(createCategoryService.execute({ title }));
    });

    await Promise.all(categoriesPromises).then(results => {
      // Handle results
      return results;
    });

    const promises: Array<Promise<Transaction>> = [];

    lines.map(linha => {
      promises.push(
        createTransactionService.execute(this.buildTransactionObj(linha)),
      );
    });

    const transactions = await Promise.all(promises).then(results => {
      // Handle results
      return results;
    });

    return transactions;
  }

  buildTransactionObj(linha: Array<string>): Line {
    const type: 'income' | 'outcome' = linha[1] as 'income' | 'outcome';
    const [title, , value, category] = linha;
    return {
      title,
      type,
      value: parseFloat(value),
      category,
      validateBalance: false,
    };
  }
}

export default ImportTransactionsService;
