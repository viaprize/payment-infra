import { ApiHandler, useHeader, useJsonBody } from "sst/node/api";
import {ChainIdSchema, Wallet, getUsdcAddress} from "@typescript-starter/core/wallet";
import { Config } from "sst/node/config";
import { Table } from "@typescript-starter/core/table";

const TYPE = "reserve";
export const create = ApiHandler(async (_evt) => {
  
  const apiKey = useHeader("x-api-key")
  const chainId= ChainIdSchema.parse(parseInt(useHeader("x-chain-id") ?? "0"))
  if (apiKey !== Config.GASLESS_API_KEY){
    return {
      statusCode: 401,
      body: "Unauthorized",
    };

  }
  const body: Wallet.CreateTransactionData | Wallet.CreateTransactionData[] =  useJsonBody()
  const {data,to,value,operation}: Wallet.CreateTransactionData = Array.isArray(body) ? body[0] : body
  if (!data || !to || !value) {
    return {
      statusCode: 400,
      body: "Invalid request",
    };
  }
  try {
    const hash = await Wallet.createTransaction([{data,to,value,operation}],TYPE,chainId)
    console.log({hash})
    return {
      statusCode: 200,
      body:JSON.stringify({hash}),
    };
    
  } catch (error) {
    return {
        statusCode: 500,
        body:JSON.stringify({message:error.message}),
    }
  }

});

export const getSigner = ApiHandler(async (_evt) => {
    return {
        statusCode: 200,
        body: JSON.stringify({ address: Wallet.getSignerAddress(TYPE) }),
    };
});
export const get = ApiHandler(async (_evt) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ address: Wallet.getAddress(TYPE) }),
  };
})


export const getBalance = ApiHandler( async (_evt) => {
  const chainId= ChainIdSchema.parse(parseInt(useHeader("x-chain-id") ?? "10"))
  const balance = await Wallet.getTokenBalance(
    getUsdcAddress(chainId),
    "reserve",
    chainId
  )
  return {
    statusCode: 200,
    body: JSON.stringify({balance : balance.toString()})
  }
})

export const getHash = ApiHandler( async (_evt) => {
  const hash = await Table.getLatestHash()
  return {
    statusCode: 200,
    body: JSON.stringify({hash})
  }
})

