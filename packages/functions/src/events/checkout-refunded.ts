import { EventHandler } from "sst/node/event-bus";
import { Stripe } from "@typescript-starter/core/payment/stripe";
import { Supabase } from "@typescript-starter/core/supabase";
export const handler = EventHandler(Stripe.Events.RefundTransaction, async (evt) => {
    const {contractAddress,refundAddress,amountInUsdc} = evt.properties
    let amountInCents = parseInt(((amountInUsdc / 1_000_000) * 100).toString())
    const fiatPayments = await Supabase.getNonRefundedFiatPayments(refundAddress.toLowerCase(),contractAddress.toLowerCase(),amountInCents)
    console.log({fiatPayments}) 
    if(!fiatPayments){
        throw new Error("No fiat payment found")
    }
    const totalAmountInCentsPaidByUser = fiatPayments.reduce((acc,curr) => acc + curr.amount_in_cents,0)
    console.log({amountInCents})
    console.log({totalAmountInCentsPaidByUser})
    if( amountInCents > totalAmountInCentsPaidByUser){
        throw new Error(`Refund amount is greater than the amount paid by the user ${refundAddress}`)

    }
    console.log({amountInCents})
    console.log({totalAmountInCentsPaidByUser})
    let index = 0;
    while(amountInCents > 0){
        const fiatPayment = fiatPayments[index];
        index = index + 1
        if(!fiatPayment){
            break
        }
        if(amountInCents < fiatPayment.amount_in_cents){
            await Stripe.refundPaymentIntent(fiatPayment.payment_id,amountInCents)
            await Supabase.updateFiatPayment(fiatPayment.payment_id,{
                amount_in_cents: fiatPayment.amount_in_cents - amountInCents,
                is_refunded: false,
                is_refund_triggered:true,
            })
            amountInCents = 0
        }
        if (amountInCents >= fiatPayment.amount_in_cents){
            await Stripe.refundPaymentIntent(fiatPayment.payment_id,fiatPayment.amount_in_cents)
            await Supabase.updateFiatPayment(fiatPayment.payment_id,{
                amount_in_cents: 0,
                is_refunded: true,
                is_refund_triggered:true,
            })
            amountInCents -= fiatPayment.amount_in_cents
        }
        
    }
});

