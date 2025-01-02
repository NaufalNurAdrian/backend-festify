export interface ITicketCartItem {
  qty: number;
  ticketId: {
    ticket_id: number;
    type: string;
    price: number;
    seats: number;
  };
}
