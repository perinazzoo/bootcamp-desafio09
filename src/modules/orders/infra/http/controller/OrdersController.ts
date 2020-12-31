import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(req: Request, res: Response): Promise<Response> {
    // TODO
  }

  public async create(req: Request, res: Response): Promise<Response> {
    // TODO
  }
}
