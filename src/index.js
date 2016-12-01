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

const Fetch = (url, {body, method}) => {
   let status

   return fetch(url, {
      headers: {
         'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"
      },
      method: method || "POST",
      ...(body ? {body: QueryString.stringify(body)} : {})
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

   addCard = (card: Card) => {
      if (!card.holder) throw new Error('Missing holder')
      if (!card.brand) throw new Error('Missing payment brand')
      if (!card.number) throw new Error('Missing card number')
      if (!card.expiryMonth) throw new Error('Missing card expiryMonth')
      if (!card.expiryYear) throw new Error('Missing card expiryYear')
      if (!card.cvv) throw new Error('Missing card cvv')

      return Fetch(`${this.config.endpoint}/v1/registrations`, {
         body: {
            ...this.config.authentication,

            paymentBrand: card.brand,
            'card.number': card.number,
            'card.holder': card.holder,
            'card.expiryMonth': card.expiryMonth,
            'card.expiryYear': card.expiryYear,
            'card.cvv': card.cvv
         }
      })
   }

   removeCard = (cardId: string) => {
      if (!cardId) throw new Error('Missing cardId')

      return Fetch(`${this.config.endpoint}/v1/registrations/${cardId}?${QueryString.stringify(this.config.authentication)}`, {
         method: "DELETE"
      })
   }

   makeTransaction = (transaction: Transaction) => {
      if (!transaction.cardId) throw new Error('Missing cardId')
      if (!transaction.amount) throw new Error('Missing amount')

      return Fetch(`${this.config.endpoint}/v1/registrations/${transaction.cardId}/payments`, {
         body: {
            ...this.config.authentication,

            amount: transaction.amount,
            currency: transaction.currency || this.config.currency,
            paymentType: transaction.type || "DB"
         }
      })
   }

   refundTransaction = (transaction: Transaction) => {
      if (!transaction.transactionId) throw new Error('Missing transactionId')
      if (!transaction.amount) throw new Error('Missing amount')

      return Fetch(`${this.config.endpoint}/v1/payments/${transaction.transactionId}`, {
         body: {
            ...this.config.authentication,

            amount: transaction.amount,
            currency: transaction.currency || this.config.currency,
            paymentType: "RF"
         }
      })
   }

   getTransaction = (transactionId: ?string) => {
      if (!transactionId) throw new Error('Missing transactionId')

      return Fetch(`${this.config.endpoint}/v1/payments/${transactionId}?${QueryString.stringify(this.config.authentication)}`, {
         method: "GET"
      })
   }
}