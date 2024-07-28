export * as Paypal from "./paypal";
import { Config } from "sst/node/config";
import { event } from "../event";
import { z } from "zod";
import paypal from '@paypal/checkout-server-sdk'
import {  OAuthV1Response, OrderV2Payload, PaymentOrder, VerifyWebhookResponse, WebhookPayload } from "../types/paypal.types";
import { nanoid } from 'nanoid'

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

export const BASE_PAYPAL_URL = "https://api-m.paypal.com";

export const generateAccessToken = async () => {
    try {
      if (!Config.PAYPAL_CLIENT_ID || !Config.PAYPAL_SECRET_KEY) {
        throw new Error("MISSING_API_CREDENTIALS");
      }
      const auth = Buffer.from(
        Config.PAYPAL_CLIENT_ID + ":" + Config.PAYPAL_SECRET_KEY
      ).toString("base64");
      const response = await fetch(`${BASE_PAYPAL_URL}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
      const data : OAuthV1Response = (await response.json() ) as OAuthV1Response; 
      return data.access_token;
    } catch (error) {
      console.error("Failed to generate Access Token:", error);  
    } 
};


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



export const createCheckout = async (amount: string,customId:string) => {

    const accessToken = await generateAccessToken();
    const url = `${BASE_PAYPAL_URL}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            
            },
            custom_id: customId,
          },
          

        ],
       
      } as OrderV2Payload;
    
    const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        method: "POST",
        body: JSON.stringify(payload),
    });
    const data = await response.json() as PaymentOrder
    
    return data;
}

export const verifyWebhook = async (webhookPayload : WebhookPayload) => {

    const accessToken = await generateAccessToken();
    console.log('jskldfjlsjfldsjlfkj')
    const res = await fetch(`${BASE_PAYPAL_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(webhookPayload)
    });

    const data = await res.json() as VerifyWebhookResponse;

    
    return data.verification_status === "SUCCESS"
}

export const captureOrder = async (orderId:string) => {
  const accessToken = await generateAccessToken();
  const url = `${BASE_PAYPAL_URL}/v2/checkout/orders/${orderId}/capture`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }
  });

  const data = await response.json();

  return data;


}