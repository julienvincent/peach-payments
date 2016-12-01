import Peach from '../src'
import 'isomorphic-fetch'

const client = new Peach({
   production: false,
   userId: "ff808081392eb9b201392f0b6d0200a3",
   password: "wCJFfx6F",
   entityId: "ff808081407bfe10014087a5dcd918ea"
})

console.log("ADDING CARD\n")
client
   .addCard({
      number: "5454545454545454",
      cvv: "123",
      expiryMonth: "08",
      expiryYear: "2018",
      brand: "MASTER",
      holder: "Julien Vincent"
   })
   .then(card => {
      console.log(card)

      console.log("\nDEBITING CARD\n")
      client
         .makeTransaction({
            transactionId: "12345",
            amount: 10,
            cardId: card.id
         })
         .then(transaction => {
            console.log(transaction)

            console.log("\nQUERYING TRANSACTION\n")
            client
               .getTransaction(transaction.id)
               .then(lastTransaction => {
                  console.log(lastTransaction)

                  console.log("\nREFUNDING DEBIT ON CARD\n")
                  client
                     .refundTransaction({
                        transactionId: transaction.id,
                        amount: "10"
                     })
                     .then(refundedTransaction => {
                        console.log(refundedTransaction)

                        console.log("\nCREDITING CARD\n")
                        client.makeTransaction({
                           type: "CD",
                           transactionId: "123456",
                           amount: 10,
                           cardId: card.id
                        })
                           .then(creditTransaction => {
                              console.log(creditTransaction)

                              console.log("\nDELETING CARD\n")
                              client
                                 .removeCard(card.id)
                                 .then(removedCard => console.log(removedCard))
                                 .catch(e => console.log(e))
                           })
                           .catch(e => console.log(e))
                     })
                     .catch(e => console.log(e))
               })
               .catch(e => console.log(e))
         })
         .catch(e => console.log(e))

   })
   .catch(e => console.log(e))