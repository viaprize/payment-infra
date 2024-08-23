import { ApiHandler, useBody, useHeader, useHeaders, useJsonBody } from "sst/node/api";
import { Paypal } from "@typescript-starter/core/payment/paypal";
import { WebhookEvent } from "@typescript-starter/core/types/paypal.types";
import { Wallet } from "@typescript-starter/core/wallet";
import { Table } from "@typescript-starter/core/table";
import { sep } from "path";
import { Supabase } from "@typescript-starter/core/supabase";




const PERCENTAGE = 5;
export const create = ApiHandler(async (_evt) => {
  return {
    statusCode:402,
    body: JSON.stringify({
      message:"Payment Not accepting"
    }),
  }
  // const {amount,metadata,customId,chainId} : {amount:string,metadata:string,customId:string,chainId:string} = useJsonBody()
  
  // const res = await Paypal.createCheckout(amount,customId)
  // console.log({res})
  // await Table.updatePaypalMetadata(customId,metadata)
  // return {
  //   statusCode: 200,
  //   body: JSON.stringify(res),
  // };
}); 

export const triggerManuelCapture = ApiHandler(async (_evt) => {
  const {customId,paypalId,email,full_name} : {customId:string,paypalId:string,email:string,full_name:string} = useJsonBody()
  console.log({customId,paypalId,email,full_name})
  const groupedDonationsByRoundId = await Table.getPaypalMetadata(customId)
  const donations = JSON.parse(groupedDonationsByRoundId) as  {
    amount: string;
    anchorAddress: string | undefined;
    roundId: string;
  }[]
  const totalAmount = donations.reduce((acc, val) => acc + parseFloat(val.amount), 0);
  const amountAfterFees = totalAmount * ((100-PERCENTAGE) / 100);
  const newAmounts = adjustArraySumProportionally(donations.map(d => parseFloat(d.amount)), amountAfterFees);
  const newDonations = donations.map((d, i) => ({
    ...d,
    amount: newAmounts[i].toString(),
  }));
  const userExist = await Supabase.ifNonLoginUserExists(email)
  if(!userExist){
    const key = Wallet.generateEncryptedPrivateKey()
    const account = Wallet.getAccountFromEncryptedPrivateKey(key);
    await Supabase.createNonLoginUser({
      email:email,
      key:key,
      wallet_address:account.address,
    })
  }
  const nonLoginUser = await Supabase.getNonLoginUser(email)

  const hash = await Wallet.fundGitcoinRounds(nonLoginUser.key,newDonations)

  if(hash){
      
    await Supabase.createGitCoinUser({
      chain_id: "42161",
      email: nonLoginUser.email,
      full_name:full_name,
      paypal_id:paypalId,
      round_id: donations[0].roundId,
      amount: amountAfterFees,
    })

    console.log("Donation creartedddds")
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      hash: hash
    }),
  };

})

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
  console.log(JSON.stringify(res))
  
  if(res.status === "COMPLETED"){
    
    const userExist = await Supabase.ifNonLoginUserExists(res.payer.email_address)
    console.log(JSON.stringify(res))
    let amountAfterFees;
    if(res.purchase_units[0].payments.captures[0].status === "PENDING"){
      amountAfterFees = parseFloat(res.purchase_units[0].payments.captures[0].amount.value);
    }
    else{
      amountAfterFees = parseFloat(res.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value);
    }
    console.log({amountAfterFees})
    if(!userExist){
      const key = Wallet.generateEncryptedPrivateKey()
      const account = Wallet.getAccountFromEncryptedPrivateKey(key);
      await Supabase.createNonLoginUser({
        email:res.payer.email_address,
        key:key,
        wallet_address:account.address,
      })
    }
    const groupedDonationsByRoundId = await Table.getPaypalMetadata(customId)


    const donations = JSON.parse(groupedDonationsByRoundId) as  {
      amount: string;
      anchorAddress: string | undefined;
      roundId: string;
  }[]

  

    const amountAfterPlatfromFees  = (amountAfterFees * ((100-PERCENTAGE) / 100))
    const newAmounts = adjustArraySumProportionally(donations.map(d => parseFloat(d.amount)), amountAfterPlatfromFees);
    const newDonations = donations.map((d, i) => ({
      ...d,
      amount: newAmounts[i].toString(),
    }));
    
    const nonLoginUser = await Supabase.getNonLoginUser(res.payer.email_address)

    const hash = await Wallet.fundGitcoinRounds(nonLoginUser.key,newDonations)
    console.log({hash})

    if(hash && userExist){
      
      await Supabase.createGitCoinUser({
        chain_id: "42161",
        email: nonLoginUser.email,
        full_name:`${res.payer.name.given_name} ${res.payer.name.surname}`,
        paypal_id:res.payer.payer_id,
        round_id: donations[0].roundId,
        amount: amountAfterPlatfromFees,
      })
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        ...res,
        hash: hash
      }),
    };

  }
 
  return {
    statusCode: 200,
    body: JSON.stringify({
      ...res,
    }),
  };
})
// export const webhook = ApiHandler(async (_evt) => {

// })