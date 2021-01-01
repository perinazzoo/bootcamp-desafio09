import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) { }

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Invalid customer id.');
    }

    const productsDb = await this.productsRepository.findAllById(products);

    if (!productsDb.length) {
      throw new AppError('All products are invalid.');
    }

    const notExistent = products.find(
      product => !productsDb.find(p => p.id === product.id),
    );

    if (notExistent) {
      throw new AppError(
        `There is a invalid product in the list: ${notExistent.id}`,
      );
    }

    const productWithoutQuantity = productsDb.find(
      product => products.find(p => p.id === product.id)!.quantity > product.quantity,
    );

    if (productWithoutQuantity) {
      throw new AppError(
        `There is a product without available quantity. Avalable: ${productWithoutQuantity.quantity}`,
      );
    }

    const finalProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: productsDb.find(p => p.id === product.id)!.price,
    }));

    const order = await this.ordersRepository.create({
      customer,
      products: finalProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
