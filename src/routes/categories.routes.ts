import { Router } from 'express';
import { getRepository } from 'typeorm';
import CreateCategoryService from '../services/CreateCategoryService';
import Category from '../models/Category';

const categoriesRouter = Router();

categoriesRouter.get('/', async (request, response) => {
  const categoryRepository = getRepository(Category);
  const categories = await categoryRepository.find();

  return response.status(200).json(categories);
  // TODO
});

categoriesRouter.post('/', async (request, response) => {
  const createCategoryService = new CreateCategoryService();
  try {
    const newCategory = await createCategoryService.execute(request.body);

    return response.status(200).json(newCategory);
  } catch (error) {
    console.error(error);
    return response.status(400).json({ ok: false });
  }
});

export default categoriesRouter;
