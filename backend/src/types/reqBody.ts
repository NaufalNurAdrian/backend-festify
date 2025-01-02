import { ITicketCartItem } from "./ticketCart";

export interface requestBody {
  totalPrice: number;
  finalPrice: number;
  ticketCart: ITicketCartItem[];
}
