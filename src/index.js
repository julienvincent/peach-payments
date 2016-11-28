// @flow
import QueryString from 'querystring'

const TestURL = "https://test.oppwa.com"
const LiveURL = "https://oppwa.com"

type Authentication = {
   'authentication.userId': ?string,
   'authentication.password': ?string,
   'authentication.entityId': ?string
}

type Config = {
   authentication: Authentication,
   currency: string,
   endpoint: string
}

type UserConfig = {
   userId: ?string,
   password: ?string,
   entityId: ?string,
   currency: ?string,
   production: ?boolean
}

type Card = {
   brand: ?string,
   number: ?string,
   holder: ?string,
   expiryMonth: ?string,
   expiryYear: ?string,
   cvv: ?string
}

type Transaction = {
   cardId: ?string,
   transactionId: ?string,
   type: ?string,
   amount: ?string,
   currency: ?string
}

const Fetch = (url, query) => {
   let status

   return fetch(url, {
         headers: {
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"
         },
         method: "POST",
         body: QueryString.stringify(query)
      })
         .then(res => {
         status = res.status
         return res.text()
      })
.then(res => {
      let formattedResponse = {
         status,
         ...JSON.parse(res)
   }

   if (status !== 200) throw formattedResponse
   return formattedResponse
})
}

export default
class Peach {

   config: Config;

   constructor(config: UserConfig) {
      if (!config.userId) throw new Error('Missing userId')
      if (!config.password) throw new Error('Missing password')
      if (!config.entityId) throw new Error('Missing entityId')

      this.config = {
         authentication: {
            'authentication.userId': config.userId,
            'authentication.password': config.password,
            'authentication.entityId': config.entityId
         },
         currency: config.currency || "ZAR",
         endpoint: config.production ? LiveURL : TestURL
      }
   }

   createCard = (card: Card) => {
   if (!card.holder) throw new Error('Missing payer name')
   if (!card.brand) throw new Error('Missing payment brand')
   if (!card.number) throw new Error('Missing card number')
   if (!card.expiryMonth) throw new Error('Missing card expiryMonth')
   if (!card.expiryYear) throw new Error('Missing card expiryYear')
   if (!card.cvv) throw new Error('Missing card cvv')

   return Fetch(`${this.config.endpoint}/v1/registrations`, {
   paymentBrand: card.brand,

   ...this.config.authentication,

   'card.number': card.number,
   'card.holder': card.holder,
   'card.expiryMonth': card.expiryMonth,
   'card.expiryYear': card.expiryYear,
   'card.cvv': card.cvv
   })
   }

   createTransaction = (transaction: Transaction) => {
   if (!transaction.cardId) throw new Error('Missing cardId')
   if (!transaction.amount) throw new Error('Missing amount')

   return Fetch(`${this.config.endpoint}/v1/registrations/${transaction.cardId}/payments`, {
   ...this.config.authentication,

   amount: transaction.amount,
   currency: transaction.currency || this.config.currency,
   paymentType: transaction.type || "DB"
   })
   }

   refundTransaction = () => {

   //
   // if (!data.transactionId) throw new Error('Missing transactionId');
   // if (!data.amount) throw new Error('Missing amount');
   //
   // var body = {
   //    'amount': data.amount,
   //    'currency': config.currency,
   //    'paymentType': 'RF',
   // }
   // var path = '/v1/payments/' + data.transactionId;
   //
   // return request(path, 'POST', body);
   }
   }