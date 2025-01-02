-- CreateTable
CREATE TABLE "OrderDetail" (
    "order_id" INTEGER NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "subtotal" INTEGER,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("order_id","ticket_id")
);

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Transaction"("transaction_id") ON DELETE RESTRICT ON UPDATE CASCADE;
