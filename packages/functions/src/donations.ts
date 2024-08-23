import { ApiHandler, useJsonBody } from "sst/node/api";
import { TransactionData } from "./types/bitcon.types";
import { TransactionData as SolanaTransactionData } from "./types/solana.types";
import { Telegram } from "@typescript-starter/core/telegram";
import { WebhookEvent } from "./types/ethereum.types";
import * as crypto from "crypto";
import { Donation } from "@typescript-starter/core/donation";

const extractDetails = (input: string) => {
    const regex = /^(\w+) transferred ([\d.]+) (\w+) to (\w+)\.$/;
    const match = input.match(regex);
  
    if (match) {
      const fromAddress = match[1];
      const value = match[2];
      const asset = match[3];
      const toAddress = match[4];
  
      return { fromAddress, value, asset, toAddress };
    }
  
    return null;
  };
function isValidSignatureForStringBody(
    body: string, // must be raw string body, not json transformed version of the body
    signature: string, // your "X-Alchemy-Signature" from header
    signingKey: string, // taken from dashboard for specific webhook
  ): boolean {
    const hmac = crypto.createHmac("sha256", signingKey); // Create a HMAC SHA256 hash using the signing key
    hmac.update(body, "utf8"); // Update the token hash with the request body using utf8
    const digest = hmac.digest("hex");
    return signature === digest;
}
const BITCOIN_ADDRESS = "bc1qjc68s72ssv98cdr76ay2g629cm60z83ssx5eyf"
// const BITCOIN_ADDRESS = "bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu"
// bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu

const SOLANA_ADDRESS = "2SRTxZEJbChYGQMJro8wCqTjVpvUc1QAcueb2tf97YGZ"

// const BASE_URL = "https://api-dev.viaprize.org"
const BASE_URL = "http://localhost:3001"
const ETHEREUM_ADDRESS = "0xcdd6c3402808Db7Cb7EA6AcBf1DF02881a31E86A"
type BitcoinTransaction = TransactionData
type EthereumWebhookEvent = WebhookEvent;
export const bitcoinWebhook = ApiHandler(async (_evt) => {
    console.log("bitcoinWebhook")
    console.log(JSON.stringify(useJsonBody()))
    const tranaction:BitcoinTransaction = useJsonBody()
    if(tranaction.address !== BITCOIN_ADDRESS){
        return {
            statusCode: 200,
            body: JSON.stringify({message:"success"}),
        }
    }
    if(tranaction.transactions[0].vout.map((vout) => vout.addresses[0]).includes(BITCOIN_ADDRESS)){
        await Donation.Events.Created.publish({
            asset: "BTC",
            from: tranaction.transactions[0].vin[0].addresses[0] ?? "undefined",
            network: "bitcoin",
            to: BITCOIN_ADDRESS,
            value:parseFloat(tranaction.transactions[0].value) / 100_000_000
        })
    }
    else{
        await Donation.Events.Created.publish({
            asset: "BTC",
            from: BITCOIN_ADDRESS,
            network: "bitcoin",
            to: tranaction.transactions[0].vin[0].addresses[0] ?? "undefined",
            value:parseFloat(tranaction.transactions[0].value) / 100_000_000
        })
    }
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
    }
})

export const ethereumWebhook = ApiHandler(async (_evt) => {
    console.log("ethereumWebhook")
    console.log(JSON.stringify(useJsonBody()))
    const webhook : EthereumWebhookEvent = useJsonBody()
    const network = webhook.event.network
    await Donation.Events.Created.publish({
        asset: webhook.event.activity[0].asset,
        from: webhook.event.activity[0].fromAddress,
        network: network,
        to: webhook.event.activity[0].toAddress,
        value:webhook.event.activity[0].value
    })
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
    }
})

export const optimismWebhook = ApiHandler(async (_evt) => {
    console.log("opWebhook")
    console.log(JSON.stringify(useJsonBody()))
    const webhook : EthereumWebhookEvent = useJsonBody()
    const network = webhook.event.network
    await Donation.Events.Created.publish({
        asset: webhook.event.activity[0].asset,
        from: webhook.event.activity[0].fromAddress,
        network: network,
        to: webhook.event.activity[0].toAddress,
        value:webhook.event.activity[0].value
    })
    return {
                statusCode: 200,
                body: JSON.stringify({message:"success"}),
            }
   
   
})

export const polygonWebhook = ApiHandler(async (_evt) => {
    console.log("polygon")
    console.log("Webhook")
    console.log(JSON.stringify(useJsonBody()))
    const webhook : EthereumWebhookEvent = useJsonBody()
    const network = webhook.event.network
    await Donation.Events.Created.publish({
        asset: webhook.event.activity[0].asset,
        from: webhook.event.activity[0].fromAddress,
        network: network,
        to: webhook.event.activity[0].toAddress,
        value:webhook.event.activity[0].value
    })
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
    }
})

export const arbitrumWebhook = ApiHandler(async (_evt) => {
    console.log("arbWebhook")
    console.log(JSON.stringify(useJsonBody()))
    const webhook : EthereumWebhookEvent = useJsonBody()
    const network = webhook.event.network
    await Donation.Events.Created.publish({
        asset: webhook.event.activity[0].asset,
        from: webhook.event.activity[0].fromAddress,
        network: network,
        to: webhook.event.activity[0].toAddress,
        value:webhook.event.activity[0].value
    })
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
    }
})

export const solanaWebhook = ApiHandler(async (_evt) => {
    console.log("solanaWebhook")
    console.log(useJsonBody())
    console.log(JSON.stringify(useJsonBody()))
    const transaction: SolanaTransactionData = useJsonBody()[0]
    if(transaction.type==="TRANSFER"){
        const details = extractDetails(transaction.description);
        if(!details){
            throw new Error("Invalid transaction description");
        }
        await Donation.Events.Created.publish({
            asset: details.asset,
            from: details.fromAddress,
            network: "solana",
            to: details.toAddress,
            value: parseFloat(details.value)
        })
    }
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
        
    }
})