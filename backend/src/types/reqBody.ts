import { ITicketCartItem } from "./ticketCart";

export interface requestBody {
  totalPrice: number;
  finalPrice: number;
  OrderDetail: ITicketCartItem[];
}
