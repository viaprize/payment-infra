export * as Supabase from "./supabase";
import { createClient } from '@supabase/supabase-js'
import { Database } from './types/database.types'
import { Config } from "sst/node/config";

const supabase = createClient<Database>(
  Config.SUPABASE_URL,
  Config.SUPABASE_ANON_KEY
)


export const addFundsToExtraPortal = async (funds: number,externalId:string) => {
   const currentFunds = await  supabase.from('extra_portal').select('funds').eq('externalId', externalId)
   if(currentFunds.error){
       throw new Error(currentFunds.error.message)
   }
   const newExtraPortal = await supabase.from('extra_portal').update({funds: currentFunds.data[0].funds + funds}).eq('externalId', externalId).select();

    if(newExtraPortal.error){
         throw new Error(newExtraPortal.error.message)
    }

   return newExtraPortal.data[0]
}

export const addDonationToExtraPortal = async (donor: string,usdValue: number,externalId:string) => {
    const newDonation = await supabase.from('extra_donation_portal_data').insert({
        donatedAt: new Date().toISOString(),
        donor,
        usdValue,
        externalId,
    }).select();
    if(newDonation.error)
    {
        throw new Error(newDonation.error.message)
    }
    return newDonation.data[0];
}

export const addFiatPayments = async (user_address:string,payment_id:string,amount_in_cents: number, contract_address: string,) => {
    const fiatPayments = await supabase.from('fiat_payments').insert({
        amount_in_cents,
        contract_address,
        payment_id,
        user_address,
    }).select();
    if(fiatPayments.error){
        throw new Error(fiatPayments.error.message)
    }
    return fiatPayments.data[0];
}

export const getNonRefundedFiatPayments = async (user_address:string,contract_address: string,amount_in_cents: number) => {
    const fiatPayments = await supabase.from('fiat_payments').select().eq('user_address',user_address).eq('contract_address',contract_address).eq('is_refunded',false)
    if(fiatPayments.error){
        throw new Error(fiatPayments.error.message)
    }
    return fiatPayments.data;
}

export const updateFiatPayment = async (payment_id:string,updated_payment: Database["public"]["Tables"]["fiat_payments"]["Update"]) => {
    const updatedFiatPayment = await supabase.from('fiat_payments').update(updated_payment).eq('payment_id',payment_id).select()
    if(updatedFiatPayment.error){
        throw new Error(updatedFiatPayment.error.message)
    }
    return updatedFiatPayment.data[0];
}