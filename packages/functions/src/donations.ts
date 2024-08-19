import { ApiHandler, useJsonBody } from "sst/node/api";
import { TransactionData } from "./types/bitcon.types";
import { TransactionData as SolanaTransactionData } from "./types/solana.types";
import { Telegram } from "@typescript-starter/core/telegram";
import { WebhookEvent } from "./types/ethereum.types";


const BITCOIN_ADDRESS = "bc1qjc68s72ssv98cdr76ay2g629cm60z83ssx5eyf"
// const BITCOIN_ADDRESS = "bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu"
// bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu

const SOLANA_ADDRESS = "2SRTxZEJbChYGQMJro8wCqTjVpvUc1QAcueb2tf97YGZ"

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
        await Telegram.sendMessage({
            chatId: "-948252043",
            text: `
            New donation of ${parseInt(tranaction.transactions[0].value) / 100_000_000} BTC
            `
        })
    }
    else{
        await Telegram.sendMessage({
            chatId: "-948252043",
            text: `
            Btc from viaprize wallet spent about  ${parseInt(tranaction.transactions[0].value) / 100_000_000} BTC
            `
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
    if(webhook.event.activity[0].toAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase()){
        await Telegram.sendMessage({
            chatId: "-948252043",
            text: `
            New donation of ${webhook.event.activity[0].value} ${webhook.event.activity[0].asset} on ${network}
            `
        })
    }
    if (webhook.event.activity[0].fromAddress.toLowerCase() === ETHEREUM_ADDRESS.toLowerCase()){
        await Telegram.sendMessage({
            chatId: "-948252043",
            text: `
            Withdrawal of ${webhook.event.activity[0].value} ${webhook.event.activity[0].asset} on ${network}
            `})
    }
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
    await Telegram.sendMessage({
        chatId: "-948252043",
        text: `
            ${transaction.description}
        `
    })
    return {
        statusCode: 200,
        body: JSON.stringify({message:"success"}),
        
    }
})