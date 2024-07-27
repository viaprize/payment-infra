import { ApiHandler, useBody, useHeader, useHeaders, useJsonBody } from "sst/node/api";
import { Paypal } from "@typescript-starter/core/payment/paypal";
import { WebhookEvent } from "@typescript-starter/core/types/paypal.types";
import { Wallet } from "@typescript-starter/core/wallet";
import { Table } from "@typescript-starter/core/table";





export const create = ApiHandler(async (_evt) => {
  console.log("jskldjflsjfkljsdklfj")
  const {amount,metadata,customId} : {amount:string,metadata:string,customId:string} = useJsonBody()
  const res = await Paypal.createCheckout(amount,customId)
  await Table.updatePaypalMetadata(customId,metadata)
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
}); 

export const webhook = ApiHandler(async (_evt) => {
  const transmissionId = useHeader('paypal-transmission-id')
  const timeStamp = useHeader('paypal-transmission-time')
  const certUrl = useHeader('paypal-cert-url')
  const transmissionSig = useHeader('paypal-transmission-sig')
  
  if(!transmissionId || !timeStamp || !certUrl || !transmissionSig){
    console.log('missing headers')
    console.log({transmissionId,timeStamp,certUrl,transmissionSig})
    return {
      statusCode: 400,
      body: JSON.stringify({message:"missing headers",headers:{transmissionId,timeStamp,certUrl,transmissionSig}}),
    };
  }
  const webhookEvent  = useJsonBody() as WebhookEvent
  const isVerified = await Paypal.verifyWebhook({
     auth_algo:"SHA256withRSA",
     cert_url:certUrl,
     transmission_id:transmissionId,
     transmission_sig:transmissionSig,
     transmission_time:timeStamp,
     webhook_event:webhookEvent,
     webhook_id:"9B460226R2159322D",
  })

  if(!isVerified){
    console.log('webhook not verified')
    return {
      statusCode: 400,
      body: JSON.stringify({message:"webhook not verified"}),
    };
  }

  console.log({webhookEvent})

  if(webhookEvent.event_type!== "CHECKOUT.ORDER.COMPLETED"){
    console.log('webhook not verified')
    return {
      statusCode: 400,
      body: JSON.stringify({message:"webhook not verified"}),
    };
  }
  const customId = webhookEvent.resource.purchase_units[0].custom_id;
  if(!customId){
    console.log('missing custom id')
    return {
      statusCode: 400,
      body: JSON.stringify({message:"missing custom id"}),
    };
  }
  const rawTxData = await Table.getPaypalMetadata(customId)
  const hash = await Wallet.createTransaction({
    data: rawTxData,
    to: Wallet.getGitCoinMultiReserveFunderRoundAddress(8453),
    value: "0",
  },"gasless",8453)
  return {
    statusCode: 200,
    body: JSON.stringify({message:"success",hash}),
  };

});

// export const webhook = ApiHandler(async (_evt) => {

// })