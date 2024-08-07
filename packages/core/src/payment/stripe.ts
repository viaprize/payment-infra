export * as Stripe from "./stripe";
import { Config } from "sst/node/config";
import {Stripe} from "stripe"
import { event } from "../event";
import { z } from "zod";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { getContractAddress } from "viem";


export type  CheckoutMetadataType = {
    contractAddress: string;
    backendId: string;
    deadline: number;
    v: number;
    r: string;
    s: string;
    amount: number;
    ethSignedMessage: string;
    chainId: number;
    payWihtoutLogin: string;
}


export const Events = {
    CheckoutConfirmed: event(
      "checkout.confirmed",
      z.object({
        contractAddress: z.string(),
        backendId: z.string(),
        v: z.number(),
        r: z.string(),
        s: z.string(),
        deadline: z.number(),
        amount: z.number(),
        ethSignedMessage: z.string(),
        chainId: z.number(),
        payWihtoutLogin: z.string()
      })
    ),
    RefundTransaction: event(
        "checkout.refunded",
        z.object({
            contractAddress: z.string(),
            amountInUsdc: z.number(),
            refundAddress: z.string()
        })
    )
}
export async  function createCheckout(checkoutMetadata: CheckoutMetadataType,title:string,imageUrl:string,successUrl:string,cancelUrl:string){
    const paymentClient = new Stripe(Config.PAYMENT_API_KEY)
    const session = await paymentClient.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: title,
                        images: [imageUrl],

                    },
                    unit_amount: (checkoutMetadata.amount / 1_000_000) * 100 ,
                },
                quantity: 1,
            },
        ],
        metadata:{
            ...checkoutMetadata
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    })
    return session.url;
}

export async function createTestCheckout(checkoutMetadata: CheckoutMetadataType,title:string,imageUrl:string,successUrl:string,cancelUrl:string){
    const paymentClient = new Stripe(Config.TESTMODE_PAYMENT_API_KEY)
    const session = await paymentClient.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: title,
                        images: [imageUrl],

                    },
                    unit_amount: (checkoutMetadata.amount / 1_000_000) * 100 ,
                },
                quantity: 1,
            },
        ],
        metadata:{
            ...checkoutMetadata
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
    })
    return session.url;

}


export async function webhook(body:string | Buffer,signature:string){
   return  Stripe.webhooks.constructEvent(body,signature,Config.PAYMENT_WEBHOOK_SECRET)
}

export async function webhookTest(body:string | Buffer,signature:string){
    return  Stripe.webhooks.constructEvent(body,signature,Config.TESTMODE_PAYMENT_WEBHOOK_SECRET)
 }

export async function refundPaymentIntent(paymentIntentId:string,amountInCents:number){
    const paymentClient = new Stripe(Config.PAYMENT_API_KEY)
    const refund = await paymentClient.refunds.create({
        payment_intent: paymentIntentId,
        amount: amountInCents,
        reason:"requested_by_customer"        
    })

    
    
    return refund;
}

