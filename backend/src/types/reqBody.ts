import { ITicketCartItem } from "./ticketCart";

export interface requestBody {
  coupon_Id?: number;
  totalPrice: number;
  finalPrice: number;
  OrderDetail: ITicketCartItem[];
}
