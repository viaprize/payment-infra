export * as Wallet from "./wallet";
import { z } from "zod";

import { event } from "./event";
import type { MetaTransactionData} from '@safe-global/safe-core-sdk-types';
import { privateKeyToAddress } from 'viem/accounts'
import { Config } from "sst/node/config";
import Safe from "@safe-global/protocol-kit";
import {  createPublicClient, encodeFunctionData, erc20Abi, http, recoverAddress, recoverPublicKey, serializeSignature } from "viem";



type WalletType = "gasless" | "reserve";



export const CampaignFundABI =  [
	{
    "constant": false,
    "inputs": [
      {
        "name": "reserveAddress",
        "type": "address"
      },
      {
        "name": "spender",
        "type": "address"
      },
      {
        "name": "_amount",
        "type": "uint256"
      },
      {
        "name": "_deadline",
        "type": "uint256"
      },
      {
        "name": "v",
        "type": "uint8"
      },
      {
        "name": "s",
        "type": "bytes32"
      },
      {
        "name": "r",
        "type": "bytes32"
      },
      {
        "name": "_ethSignedMessageHash",
        "type": "bytes32"
      }
    ],
    "name": "fundUsingUsdc",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }  
] as const;


export type CreateTransactionData  = MetaTransactionData;
const safeWallets = {
  gasless: "0x8e0103Af21C9a474035Bf00B56195b9ef3196C99",
  reserve: "0xF7D1D901d15BBf60a8e896fbA7BBD4AB4C1021b3",
} as const;

const reserveFundCampaignAddress = {
  10:"0x690f51E4D54c131e4ed68A80b59Feb3487DeE898",
  8453:"0xEFB4611950c2bCa4e41c5992a0D404EA81e5D14D"
} as const;

const usdcAddress = {
  10:"0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  8453:"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"
} as const;

const gitCoinMultiReserveFunderRoundAddress = {
  10: "0x15fa08599EB017F89c1712d0Fe76138899FdB9db",
  8453: "0x042623838e4893ab739a47b46D246140477e0aF1"
}
export const getUsdcAddress = (chainId: ChainId) => usdcAddress[chainId];

export const Events = {
  Created: event(
    "wallet.transaction",
    z.object({
      address: z.string(),
      type: z.union([z.literal("gasless"), z.literal("reserve")]),
      hash: z.string(),
      chainId: z.union([z.literal(10), z.literal(8453)]),
    })
  ),
};

export type ChainId = 10 | 8453;

export const ChainIdSchema = z.union([z.literal(10), z.literal(8453)]).default(10);

export  function getAddress(type: WalletType) {
  return safeWallets[type];
}

export function getSignerAddress(type: WalletType){
  switch(type){
    case "gasless":
      return privateKeyToAddress(Config.GASLESS_KEY as `0x${string}`)
    case "reserve":
      return privateKeyToAddress(Config.RESERVE_KEY as `0x${string}`)
  }
}

function getSigner(type: WalletType){
  switch(type){
    case "gasless":
      return Config.GASLESS_KEY
    case "reserve":
      return Config.RESERVE_KEY
  }
}

export  function getRPC(chainId: ChainId){
  switch(chainId){
    case 10:
      return Config.OP_RPC_URL
    case 8453:
      return Config.BASE_RPC_URL
  }
}



export async function getTokenBalance(token: string | "eth",type:WalletType,chainId: ChainId,signer: boolean = false){
  const client = createPublicClient({
  
    transport:http(getRPC(chainId)),
  })
  const wallletAddress = signer ?  getSignerAddress(type): getAddress(type)
  if(token === "eth"){
    const balance = await client.getBalance({
      address:wallletAddress
    })
    return balance;
  }
  const balance = await client.readContract(
   {
    abi:erc20Abi,
    address:token as `0x${string}`,
    functionName:"balanceOf",
    args:[wallletAddress]
   }
  )
  return balance;
}


export async function  createTransaction(transactionData : MetaTransactionData,type: WalletType,chainId: ChainId) : Promise<string>{
  const signer = getSigner(type);
  if(!signer){
    throw new Error("No signer key found")
  }
  if(!Config.OP_RPC_URL){
    throw new Error("No OP_RPC_URL found")
  }
  const safeAddress = getAddress(type)
  const rpcUrl = getRPC(chainId)

  const protocolKit  = await Safe.default.init({
    provider:rpcUrl,
    signer: signer,
    safeAddress: safeAddress,

   })
  const safeTransactionProtocol = await protocolKit.createTransaction({ transactions: [transactionData] })
  const executeTxResponse = await protocolKit.executeTransaction(safeTransactionProtocol)



  const output =  await Events.Created.publish({
    address: safeAddress,
    type,
    hash: executeTxResponse.hash,
    chainId
  })
  
  console.log("output",output)

 
  
  return executeTxResponse.hash

}
// 6A68842910269935M
export function getReserveFundCampaignAddress(chainId : ChainId){
  return reserveFundCampaignAddress[chainId]
}

export function getGitCoinMultiReserveFunderRoundAddress(chainId : ChainId){
  return gitCoinMultiReserveFunderRoundAddress[chainId]
}

export async function reserveFundCampaign(contractAddress : string, amount: number,deadline : number,v : number, s: string,r: string, ethSignedMessage: string,chainId:ChainId){
  const reserveAddress = getReserveFundCampaignAddress(chainId)
  const data = encodeFunctionData({
    abi:CampaignFundABI,
    functionName:"fundUsingUsdc",
    args:[getAddress("reserve"),contractAddress as `0x${string}` ,BigInt(amount),BigInt(deadline),v,r as `0x${string}`, s as `0x${string}`,ethSignedMessage as `0x${string}`]
  }) 
  console.log({data})
  return createTransaction({data,to:reserveAddress,value:"0"},"reserve",chainId).catch((error) => {
    console.log("error",error)
  })
}



export const Utils = {
  recoverAddress: recoverAddress,
  serializeSignature: serializeSignature
}