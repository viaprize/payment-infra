import { ApiHandler, useHeader, useJsonBody } from "sst/node/api";
import { ChainId, ChainIdSchema, Wallet } from "@typescript-starter/core/wallet";
import { Config } from "sst/node/config";


const TYPE = "gasless";

export const create = ApiHandler(async (_evt) => {
  const apiKey = useHeader("x-api-key")
  const chainId= ChainIdSchema.parse(parseInt(useHeader("x-chain-id") ?? "10"))

 
  
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
    const hash = await Wallet.createTransaction(Array.isArray(body) ? body : [{data,to,value,operation}],TYPE,chainId)
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
    body: JSON.stringify({ address: Wallet.getAddress("gasless") }),
  };
})
