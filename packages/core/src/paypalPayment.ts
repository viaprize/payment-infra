export * as paypalPayment from "./paypalPayments";
import { Config } from "sst/node/config";
import {Stripe} from "stripe"
import { event } from "./event";
import { z } from "zod";
import paypal from '@paypal/checkout-server-sdk'


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
export async  function createPaypalCheckout(amount:number){
    const environment = new paypal.core.SandboxEnvironment(Config.TESTMODE_PAYPAL_CLIENT_ID, Config.TESTMODE_PAYPAL_SECRET_KEY);
    const client = new paypal.core.PayPalHttpClient(environment);
    const request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'USD',
                    value: (amount).toString()
                }
            }
        ],
    })
    const createOrder = async () => {
        const response = await client.execute(request);
        return response.result.id;  
    };

    let orderId = await createOrder();  
    const url = `https://api-m.sandbox.paypal.com/v2/payments/captures/${orderId}`

    console.log(orderId);  
    console.log()
    return url;
}

