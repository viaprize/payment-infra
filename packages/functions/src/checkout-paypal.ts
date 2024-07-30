import { ApiHandler, useBody, useHeader, useHeaders, useJsonBody } from "sst/node/api";
import { Paypal } from "@typescript-starter/core/payment/paypal";
import { WebhookEvent } from "@typescript-starter/core/types/paypal.types";
import { Wallet } from "@typescript-starter/core/wallet";
import { Table } from "@typescript-starter/core/table";
import { sep } from "path";
import { Supabase } from "@typescript-starter/core/supabase";





export const create = ApiHandler(async (_evt) => {
 
  const {amount,metadata,customId} : {amount:string,metadata:string,customId:string} = useJsonBody()
  console.log({amount,metadata,customId})
  const res = await Paypal.createCheckout(amount,customId)
  console.log({res})
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
     webhook_id:"839864068R892862M",
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
function adjustArraySumProportionally(arr: number[], targetSum: number): number[] {
  const currentSum = arr.reduce((acc, val) => acc + val, 0);
  const ratio = targetSum / currentSum;
  const adjustedArray = arr.map(val => Math.round((val * ratio) * 1000) / 1000);
  return adjustedArray;
}

export const captureCheckout = ApiHandler(async (_evt) => {
  const {orderId,customId} : {orderId:string,customId:string} = useJsonBody()
  console.log({orderId,customId})
  
  const res :any = await Paypal.captureOrder(orderId)
  console.log(res)
  
  if(res.status === "COMPLETED"){
    
    const userExist = await Supabase.ifGitcoinUserExists(res.payer.email_address)
    const amount_after_fees = parseFloat(res.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value);
    if(!userExist){
      const key = Wallet.generateEncryptedPrivateKey()
      await Supabase.createGitCoinUser({
        email:res.payer.email_address,
        full_name:`${res.payer.name.given_name} ${res.payer.name.surname}`,
        key:key,
        paypal_id:res.payer.payer_id,
        amount:amount_after_fees
      })
    }
    const groupedDonationsByRoundId = await Table.getPaypalMetadata(customId)


    const donations = JSON.parse(groupedDonationsByRoundId) as  {
      amount: string;
      anchorAddress: string | undefined;
      roundId: string;
  }[]
    const newAmounts = adjustArraySumProportionally(donations.map(d => parseFloat(d.amount)), amount_after_fees);
    const newDonations = donations.map((d, i) => ({
      ...d,
      amount: newAmounts[i].toString(),
    }));
    
    const gitCoinUser = await Supabase.getGitCoinUser(res.payer.email_address)

    const hash = await Wallet.fundGitcoinRounds(gitCoinUser.key,newDonations)
    console.log({hash})

    if(hash && userExist){
      await Supabase.updateGitCoinUser(res.payer.email_address,{
        amount:gitCoinUser.amount + amount_after_fees
      })
    }

  }
 
  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
})
// export const webhook = ApiHandler(async (_evt) => {

// })