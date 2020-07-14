import { getRepository } from 'typeorm';

import Category from '../models/Category';

interface Request {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: Request): Promise<Category> {
    const categoryRepository = getRepository(Category);

    const checkCategoryExists = await categoryRepository.findOne({
      where: {
        title,
      },
    });

    if (checkCategoryExists) {
      return checkCategoryExists;
    }

    const newCategory = categoryRepository.create({ title });

    await categoryRepository.save(newCategory);

    return newCategory;
  }
}

export default CreateCategoryService;
