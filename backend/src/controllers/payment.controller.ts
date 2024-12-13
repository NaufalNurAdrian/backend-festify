// import { Request, Response } from "express";
// import prisma from "../prisma";
// import { TicketType } from "@prisma/client";

// export class PaymentController {
//   async getTicketId(res: Response, req: Request) {
//     try {
//       const ticket = await prisma.ticket.findMany({
//         select: {
//           ticket_id: true,
//           type: true,
//           price: true,
//           seats: true,
//           event: {
//             select: {
//               event_id: true,
//             },
//           },
//         },
//       });
//     } catch (err) {}
//   }
// }
