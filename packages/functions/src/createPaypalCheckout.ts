import { ApiHandler, useBody, useHeader, useJsonBody } from "sst/node/api";
import { paypalPayment } from "@typescript-starter/core/paypalPayment";
import * as Wallet from "@typescript-starter/core/wallet";
import {Supabase} from "@typescript-starter/core/supabase"
import { Config } from "sst/node/config";



export const create = ApiHandler(async (_evt) => {
  const {amount} = useJsonBody()
  const checkoutUrl = await paypalPayment.createPaypalCheckout(amount)
  return {
    statusCode: 200,
    body: JSON.stringify({checkoutUrl}),
  };
}); 

// export const webhook = ApiHandler(async (_evt) => {

// })