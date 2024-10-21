
import { ChainIdSchema, reserveFundCampaign, Wallet } from "@typescript-starter/core/wallet";
import { ApiHandler, useHeader, useJsonBody } from "sst/node/api";
import { Config } from "sst/node/config";
import {z} from "zod"
export const generate = ApiHandler(async (_evt) => {
    const key = Wallet.generateEncryptedPrivateKey()
    const address = Wallet.generateAddressFromEncryptedPrivateKey(key);
    console.log("address", address)

    return {
        statusCode: 200,
        body: JSON.stringify({ address, key }),
    }
})

const signUsdcBodySchema = z.object({
    spender: z.string(),
    key: z.string(),
    value: z.number(),
    deadline: z.number(),
})
const signVoteBodySchema = z.object({
    spender: z.string(),
    key: z.string(),
    amount: z.number(),
    submissionHash: z.string(),
})
export const signVote = ApiHandler(async (_evt) => {
    const apiKey = useHeader("x-api-key")
    const chainId= ChainIdSchema.parse(parseInt(useHeader("x-chain-id") ?? "10"))
    if(apiKey !== Config.GASLESS_API_KEY){
        return {
            statusCode: 401,
            body: "Unauthorized",
        }
    }

    const body = signVoteBodySchema.parse(useJsonBody())
    const res = await Wallet.signVoteSignatureUsingCustodialWallet({
        amount: body.amount,
        chainId,
        contractAddress: body.spender as `0x${string}`,
        encryptedKey: body.key as `0x${string}`,
        submissionHash: body.submissionHash as `0x${string}`,
    })

    return {
        statusCode: 200,
        body: JSON.stringify({ signature:res.signature,hash:res.hash }),
    }

})
export const signUsdc = ApiHandler(async (_evt) => {
    const apiKey = useHeader("x-api-key")
    const chainId= ChainIdSchema.parse(parseInt(useHeader("x-chain-id") ?? "10"))
  
    console.log(Config.GASLESS_API_KEY)
    
    if (apiKey !== Config.GASLESS_API_KEY){
        
      return {
        
  
        statusCode: 401,
        body: "Unauthorized",
      };
  
    }
    const body =  signUsdcBodySchema.parse(useJsonBody())
    const res = await Wallet.signWalletSignatureUsingCustodialWallet({
        chainId,
        amount: BigInt(body.value),
        encryptedKey: body.key,
        spender: body.spender as `0x${string}`,
        deadline: BigInt(body.deadline),
    })
    return {
        statusCode: 200,
        body: JSON.stringify({ hash:res.hash, signature: res.signature }),
    }
})