export * as Wallet from "./wallet";
import { z } from "zod";

import { event } from "./event";
import type { MetaTransactionData} from '@safe-global/safe-core-sdk-types';
import { privateKeyToAddress,generatePrivateKey, privateKeyToAccount} from 'viem/accounts'
import { Config } from "sst/node/config";
import Safe from "@safe-global/protocol-kit";
import {  createPublicClient, createWalletClient, encodeAbiParameters, encodeFunctionData, erc20Abi, Hex, hexToSignature, http, parseAbiParameters, parseUnits,getAddress as verifyAddress, recoverAddress, recoverPublicKey, serializeSignature, parseEther } from "viem";
import AESEncryption from "aes-encryption";
import { getTokenByChainIdAndAddress, TToken } from "@gitcoin/gitcoin-chain-data";
import {groupBy} from "lodash"
import { MULTI_ROUND_CHECKOUT } from "./constants";
import {base} from "viem/chains"

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

const aesEncryption = new AESEncryption();

aesEncryption.setSecretKey(Config.AES_SECRET_KEY);

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
const usdcSignType = ({
  owner,
  spender,
  value,
  nonce,
  deadline,
  usdc
}: {
  owner: string;
  spender: string;
  value: BigInt;
  nonce: BigInt;
  deadline: BigInt;
  usdc: string;
}) => {
  return {
    message: {
      owner,
      spender,
      value,
      nonce,
      deadline,
    },
    types: {
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    },
    primaryType: 'Permit',
    domain: {
      chainId: 8453,
      verifyingContract: usdc,
      name: 'USD Coin',
      version: '2',
    },
  };
};

export async function erc20Transfer(token:`0x${string}`,to:`0x${string}`,amount:bigint,chainId:ChainId,walletType:WalletType){
  const data = encodeFunctionData({
    abi:erc20Abi,
    functionName:"transfer",
    args:[to,amount]
  })
  return createTransaction({data,to:token,value:"0"},walletType,chainId).catch((error) => {
    console.log("error",error)
  })
  
}

export async function  fundGitcoinRounds(encryptedKey: string,donations: {
  amount: string;
  anchorAddress: string | undefined;
  roundId: string;
}[]) {
  
  
  const key = aesEncryption.decrypt(encryptedKey)
  const account = privateKeyToAccount(key as `0x${string}`)
  const wallet = createWalletClient({
    transport: http(Config.BASE_RPC_URL),
    account,
  });
  const publicClient = createPublicClient({
    transport: http(Config.BASE_RPC_URL),
  });
  const totalAmountInUSD = donations.reduce((acc, d) => acc + parseFloat(d.amount), 0) * 1_000_000;
  const nonce = await publicClient.readContract({
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: 'owner',
            type: 'address',
          },
        ],
        name: 'nonces',
        outputs: [
          {
            name: '',
            type: 'uint256',
          },
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function',
      },
    ] as const,
    address: getUsdcAddress(8453),
    functionName: 'nonces',
    args: [wallet.account.address],
  });

  const deadline = Math.floor(Date.now() / 1000) + 100_000;
  const usdc = getUsdcAddress(8453);
  const usdcTT = getTokenByChainIdAndAddress(8453, usdc);
 
  const signType = usdcSignType({
    deadline: BigInt(deadline),
    nonce: nonce,
    owner: wallet.account.address,
    spender:"0x7C24f3494CC958CF268a92b45D7e54310d161794",
    usdc:getUsdcAddress(8453),
    value: BigInt(totalAmountInUSD),
  })
  const signature = await wallet.signTypedData(signType as any);

  const rsv = hexToSignature(signature);



  const groupedDonationsByRoundId = groupBy(
    donations.map((d) => ({
      amount: d.amount,
      anchorAddress: d.anchorAddress,
      roundId: d.roundId,
    })),
    "roundId"
  );
  const groupedEncodedVotes: Record<string, Hex[]> = {};
  if (!groupedDonationsByRoundId) {
    throw new Error('groupedDonationsByRoundId is null');
  }
  for (const roundId in groupedDonationsByRoundId) {
    if (!groupedDonationsByRoundId[roundId]) {
      throw new Error('groupedDonationsByRoundId[roundId] is null');
    }
    groupedEncodedVotes[roundId] = encodedQFAllocation(
      usdcTT,
      // @ts-ignore: Object is possibly 'null'.
      groupedDonationsByRoundId![roundId].map((d) => ({
        anchorAddress: d.anchorAddress ?? '',
        amount: d.amount,
      })),
    );
  }
  const amountArray: bigint[] = [];
  for (const roundId in groupedDonationsByRoundId) {
    if (!groupedDonationsByRoundId[roundId]) {
      continue;
    }
    // @ts-ignore: Object is possibly 'null'.
    groupedDonationsByRoundId[roundId].map((donation) => {
      amountArray.push(parseUnits(donation.amount, usdcTT.decimals));
    });
    }
  const poolIds = Object.keys(groupedEncodedVotes).flatMap((key) => {
  const count = groupedEncodedVotes[key].length;
    return new Array(count).fill(key);
  });
  const data = Object.values(groupedEncodedVotes).flat();
  if(!rsv.v){
    throw new Error("Invalid signature")
  }
  const txData = encodeFunctionData({
    abi: MULTI_ROUND_CHECKOUT,
    functionName:'allocateERC20Permit',
    args:[
      data,
      poolIds,
      Object.values(amountArray),
      Object.values(amountArray).reduce((acc, b) => acc + b),
      usdcTT.address as Hex,
      BigInt(deadline),
      parseInt(rsv?.v.toString()),
      rsv.r as Hex,
      rsv.s as Hex,
    ]
  })
  const gaslessWallet = createWalletClient({
    transport: http(Config.BASE_RPC_URL),
    account: privateKeyToAccount(getSigner("gasless") as `0x${string}`),
  })
  const transferHash = await erc20Transfer(usdcTT.address as `0x${string}`,account.address,BigInt(totalAmountInUSD),8453,"reserve")
  console.log({transferHash})
  try{
    await publicClient.estimateGas({
      account:wallet.account,
      to:'0x7C24f3494CC958CF268a92b45D7e54310d161794',
      data:txData
    })
  } catch(e){
    console.log("error",e)
    const transferGasHash = await gaslessWallet.sendTransaction({
      to:account.address,
      chain:base,
      value:parseEther("0.0003")
    })
    console.log({transferGasHash})
  }
  const gasEstimate = await publicClient.estimateGas({
    account:wallet.account,
    to:'0x7C24f3494CC958CF268a92b45D7e54310d161794',
    data:txData
  })

  console.log({gasEstimate})
  // const transferGasHash = await createTransaction({
  //   to:account.address,
  //   value:(parseFloat(gasEstimate.toString()) * 1.5).toString(),
  //   data:"0x"
  // },"gasless",8453)

  // console.log({transferGasHash})
  const hash = await wallet.sendTransaction({
    to: '0x7C24f3494CC958CF268a92b45D7e54310d161794',
    data: txData,
    value: BigInt(0),
    chain: base,
  });

  console.log({hash})

  return hash;
}

export const generateEncryptedPrivateKey = () : string =>{
  const privateKey = generatePrivateKey();
  return aesEncryption.encrypt(privateKey)
}

export const Utils = {
  recoverAddress: recoverAddress,
  serializeSignature: serializeSignature
}

function encodedQFAllocation(
  donationToken: TToken,
  donations: { anchorAddress: string; amount: string }[],
): Hex[] {
  const tokenAddress = donationToken.address as `0x${string}`;

  const encodedData = donations.map((donation) => {
    if (!donation.anchorAddress) {
      throw new Error('Anchor address is required for QF allocation');
    }
    return encodeAbiParameters(
      parseAbiParameters('address,uint8,(((address,uint256),uint256,uint256),bytes)'),
      [
        verifyAddress(donation.anchorAddress),
        0, // permit type of none on the strategy
        [
          [
            [
              verifyAddress(tokenAddress),
              parseUnits(donation.amount, donationToken.decimals),
            ],
            BigInt(0), // nonce, since permit type is none
            BigInt(0), // deadline, since permit type is none
          ],
          '0x0000000000000000000000000000000000000000000000000000000000000000', // signature, since permit type is none
        ],
      ],
    );
  });

  return encodedData;
}