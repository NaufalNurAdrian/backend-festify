
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.0.0
 * Query Engine version: 5dbef10bdbfb579e07d35cc85fb1518d357cb99e
 */
Prisma.prismaVersion = {
  client: "6.0.0",
  engine: "5dbef10bdbfb579e07d35cc85fb1518d357cb99e"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  user_id: 'user_id',
  username: 'username',
  email: 'email',
  password: 'password',
  phone: 'phone',
  referralCode: 'referralCode',
  referredBy_id: 'referredBy_id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  coupon_id: 'coupon_id',
  loginAttempt: 'loginAttempt',
  isVerify: 'isVerify',
  isSuspend: 'isSuspend',
  referral_id: 'referral_id',
  points: 'points',
  avatar: 'avatar'
};

exports.Prisma.EventScalarFieldEnum = {
  event_id: 'event_id',
  title: 'title',
  description: 'description',
  location: 'location',
  startTime: 'startTime',
  endTime: 'endTime',
  status: 'status',
  isFree: 'isFree',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  user_id: 'user_id',
  thumbnail: 'thumbnail',
  slug: 'slug',
  category: 'category'
};

exports.Prisma.TicketScalarFieldEnum = {
  ticket_id: 'ticket_id',
  type: 'type',
  price: 'price',
  seats: 'seats',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  event_id: 'event_id',
  lastOrder: 'lastOrder'
};

exports.Prisma.TransactionScalarFieldEnum = {
  transaction_id: 'transaction_id',
  totalPrice: 'totalPrice',
  finalPrice: 'finalPrice',
  referralUsed: 'referralUsed',
  transactionDate: 'transactionDate',
  paymentStatus: 'paymentStatus',
  createdAt: 'createdAt',
  user_id: 'user_id',
  coupon_Id: 'coupon_Id',
  expiredAt: 'expiredAt'
};

exports.Prisma.OrderDetailScalarFieldEnum = {
  orderId: 'orderId',
  ticket_id: 'ticket_id',
  qty: 'qty',
  subtotal: 'subtotal',
  used: 'used',
  qrCode: 'qrCode'
};

exports.Prisma.CouponScalarFieldEnum = {
  coupon_id: 'coupon_id',
  discountAmount: 'discountAmount',
  used: 'used',
  expiresAt: 'expiresAt'
};

exports.Prisma.ReferralLogScalarFieldEnum = {
  referral_id: 'referral_id',
  pointsAwarded: 'pointsAwarded',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  used: 'used'
};

exports.Prisma.PromotionScalarFieldEnum = {
  promotion_id: 'promotion_id',
  code: 'code',
  discount: 'discount',
  maxUsage: 'maxUsage',
  currentUsage: 'currentUsage',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  event_id: 'event_id'
};

exports.Prisma.ReviewScalarFieldEnum = {
  userId: 'userId',
  eventId: 'eventId',
  rating: 'rating',
  review: 'review',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.EventStatus = exports.$Enums.EventStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.Category = exports.$Enums.Category = {
  MUSIC: 'MUSIC',
  FILM: 'FILM',
  SPORT: 'SPORT',
  EDUCATION: 'EDUCATION'
};

exports.TicketType = exports.$Enums.TicketType = {
  FREE: 'FREE',
  STANDARD: 'STANDARD',
  VIP: 'VIP',
  VVIP: 'VVIP'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Event: 'Event',
  Ticket: 'Ticket',
  Transaction: 'Transaction',
  OrderDetail: 'OrderDetail',
  Coupon: 'Coupon',
  ReferralLog: 'ReferralLog',
  Promotion: 'Promotion',
  Review: 'Review'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
