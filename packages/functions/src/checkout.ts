import { ApiHandler, useBody, useHeader, useJsonBody } from "sst/node/api";
import { CheckoutMetadataType,  Stripe} from "@typescript-starter/core/payment/stripe";
import * as Wallet from "@typescript-starter/core/wallet";
import {Supabase} from "@typescript-starter/core/supabase"
import { Config } from "sst/node/config";



type CheckoutData = {checkoutMetadata:CheckoutMetadataType,title:string,imageUrl:string,backendId:string,amount:number,successUrl:string,cancelUrl:string} 
export const create = ApiHandler(async (_evt) => {
  const {checkoutMetadata,title,imageUrl,backendId,successUrl,cancelUrl} : CheckoutData = useJsonBody()
  const checkoutUrl = await Stripe.createCheckout(checkoutMetadata,title,imageUrl,successUrl,cancelUrl)
  return {
    statusCode: 200,
    body: JSON.stringify({checkoutUrl}),
  };
}); 

export const triggerRefundEvent = ApiHandler(async (_evt) => {
    const apiKey = useHeader("x-api-key")
    if (apiKey !== Config.PAYMENT_SECRET_KEY){
        return {
            statusCode: 401,
            body: "Unauthorized",
        };
    }
    const {contractAddress,refundAddress,amountInUsdc} : {contractAddress:string,refundAddress:string,amountInUsdc:string} = useJsonBody()
    const event = await Stripe.Events.RefundTransaction.publish({
        amountInUsdc: parseInt(amountInUsdc),
        contractAddress: contractAddress,
        refundAddress: refundAddress
    })

    return {
      statusCode: 200,
      body: JSON.stringify({event:event.$metadata}),
    };
})
export const createTestCheckout = ApiHandler(async (_evt) => {
    const {checkoutMetadata,title,imageUrl,backendId,successUrl,cancelUrl} : CheckoutData = useJsonBody()
    const checkoutUrl = await Stripe.createTestCheckout(checkoutMetadata,title,imageUrl,successUrl,cancelUrl)
    return {
      statusCode: 200,
      body: JSON.stringify({checkoutUrl}),
    };
});

export const webhook = ApiHandler(async (_evt) => {
    const sig = useHeader("stripe-signature") as string;
    const body = useBody();
    if(!body){
        return {
            statusCode: 400,
            body: "Invalid request without body",
        };
    }
    let event;
    try {
        event = await Stripe.webhook(body ,sig)
    } catch (err) {
        return {
            statusCode: 400,
            body: `Webhook Error: ${(err as Error).message}`,
        };
    }

    switch (event.type) {
      case 'checkout.session.completed':
        
        
        if(event.data.object.cancel_url !== "https://stripe.com"){
            
            const checkoutSessionCompleted = event.data.object;
            if(!checkoutSessionCompleted.metadata){
                return {
                statusCode: 400,
                body: "Invalid request without metadata",
                };
            }
            if(!checkoutSessionCompleted.payment_intent || !checkoutSessionCompleted.amount_total){
                return {
                    statusCode: 400,
                    body: "Invalid request without payment intent or amount total",
                };

            }
            
           
            let { contractAddress, amount,backendId,deadline,r,s,v,ethSignedMessage,chainId} : CheckoutMetadataType = checkoutSessionCompleted.metadata as unknown as CheckoutMetadataType;
    
            if(!chainId ){
                chainId = 10
            }
            
            chainId = parseInt(chainId.toString())
            console.log(`🔔  Checkout session completed: ${checkoutSessionCompleted.id}`);
            const hash = await Wallet.reserveFundCampaign(contractAddress, amount,deadline,v,s,r,ethSignedMessage,chainId as Wallet.ChainId);
            console.log({hash})

            if(hash){
                const userAddress = await Wallet.Utils.recoverAddress({
                    hash:ethSignedMessage as `0x${string}`,
                    signature: {
                        r : r as `0x${string}`,
                        s: s as `0x${string}`,
                        v: BigInt(v)
                    }

                })
                await Supabase.addFiatPayments(
                    userAddress.toLowerCase(),
                    checkoutSessionCompleted.payment_intent.toString(),
                    checkoutSessionCompleted.amount_total,
                    contractAddress.toLowerCase(),
                )
            }
            return {
                statusCode: 200,
                body: JSON.stringify({
                    hash,
                    message:"Checkout session completed",
                }),
            };
        }
        if(!event.data.object.amount_total){
            return {
                statusCode: 400,
                body: "Amount total not found",
                };
        }
        const funds =  event.data.object.amount_total / 100;
        const latestFunds  = await Supabase.addFundsToExtraPortal(funds,"bacb6584-7e45-465b-b4af-a3ed24a84233")
        const latestDonation = await Supabase.addDonationToExtraPortal(event.data.object.customer_details?.name ?? "Anonymous",funds,"bacb6584-7e45-465b-b4af-a3ed24a84233")
       
        return {
            statusCode: 200,
            body: JSON.stringify({
                latestFunds,
                latestDonation
            })
        }
        
        
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }  
    return {
      statusCode: 200,
      body: "Checkout session completed",
  };

  }
);

export const webhookTest = ApiHandler(async (_evt) => {
    const sig = useHeader("stripe-signature") as string;
    const body = useBody();
    if(!body){
        return {
            statusCode: 400,
            body: "Invalid request without body",
        };
    }
    let event;
    try {
        event = await Stripe.webhookTest(body ,sig)
    } catch (err) {
        return {
            statusCode: 400,
            body: `Webhook Error: ${(err as Error).message}`,
        };
    }

    switch (event.type) {
      case 'checkout.session.completed':
        
        if(event.data.object.cancel_url !== "https://stripe.com"){
            
            const checkoutSessionCompleted = event.data.object;
            if(!checkoutSessionCompleted.metadata){
                return {
                statusCode: 400,
                body: "Invalid request without metadata",
                };
            }
    
            let { contractAddress, amount,backendId,deadline,r,s,v,ethSignedMessage,chainId} : CheckoutMetadataType = checkoutSessionCompleted.metadata as unknown as CheckoutMetadataType;
    
            if(!chainId ){
                chainId = 10
            }
            
            chainId = parseInt(chainId.toString())
            console.log(`🔔  Checkout session completed: ${checkoutSessionCompleted.id}`);
            const hash = await Wallet.reserveFundCampaign(contractAddress, amount,deadline,v,s,r,ethSignedMessage,chainId as Wallet.ChainId);
            console.log({hash})
            return {
                statusCode: 200,
                body: JSON.stringify({
                    hash,
                    message:"Checkout session completed",
                }),
            };
        }
        if(!event.data.object.amount_total){
            return {
                statusCode: 400,
                body: "Amount total not found",
                };
        }
        const funds =  event.data.object.amount_total / 100;
        const latestFunds  = await Supabase.addFundsToExtraPortal(funds,"bacb6584-7e45-465b-b4af-a3ed24a84233")
        const latestDonation = await Supabase.addDonationToExtraPortal(event.data.object.customer_details?.name ?? "Anonymous",funds,"bacb6584-7e45-465b-b4af-a3ed24a84233")
       
        return {
            statusCode: 200,
            body: JSON.stringify({
                latestFunds,
                latestDonation
            })
        }
        
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }  
    return {
      statusCode: 200,
      body: "Checkout session completed",
  };

  }
);


