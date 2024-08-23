import { EventHandler } from "sst/node/event-bus";
import {Donation} from "@typescript-starter/core/donation"
import { Telegram } from "@typescript-starter/core/telegram";

const BITCOIN_ADDRESS = "bc1qjc68s72ssv98cdr76ay2g629cm60z83ssx5eyf"
// const BITCOIN_ADDRESS = "bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu"
// bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu

const SOLANA_ADDRESS = "2SRTxZEJbChYGQMJro8wCqTjVpvUc1QAcueb2tf97YGZ"

const BASE_URL = "https://api-dev.viaprize.org"
// const BASE_URL = "http://127.0.0.1:3001"
const ETHEREUM_ADDRESS = "0xcdd6c3402808Db7Cb7EA6AcBf1DF02881a31E86A"

export const handler = EventHandler(Donation.Events.Created, async (evt) => {
    const { value,from,network,to ,asset} = evt.properties;
    await Telegram.sendMessage({
    chatId:"-948252043",
    text:`
==========================
    New donation received
    from: ${from}
    to: ${to}
    network: ${network}
    value: ${value}
    asset: ${asset}
==========================   
    `
    })

    console.log("hiiialsfjlasjfla;")

    if([ETHEREUM_ADDRESS , BITCOIN_ADDRESS , SOLANA_ADDRESS].map(a=>a.toLowerCase()).includes(to.toLowerCase())){
        await fetch(`${BASE_URL}/api/prizes/extra_data/donations/1c5a8b62-ae43-4dde-b550-95848c7f9729`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                donor: from,
                value: value,
                valueIn:asset,
                externalId: "1c5a8b62-ae43-4dde-b550-95848c7f9729"
            })
        })
        
        if(asset === "USDC" || asset === "USDT"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/1c5a8b62-ae43-4dde-b550-95848c7f9729`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsUsd: value,
                    externalId: "1c5a8b62-ae43-4dde-b550-95848c7f9729",
                })
            })
        }
        else if (asset === "ETH"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/1c5a8b62-ae43-4dde-b550-95848c7f9729`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInEth: value,
                    externalId: "1c5a8b62-ae43-4dde-b550-95848c7f9729"
                })
            })
        }
        else if (asset === "BTC"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/1c5a8b62-ae43-4dde-b550-95848c7f9729`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInBtc: value,
                    externalId: "1c5a8b62-ae43-4dde-b550-95848c7f9729"
                })
            })
        }
        else if (asset === "SOL"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/1c5a8b62-ae43-4dde-b550-95848c7f9729`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInSol: value,
                    externalId: "1c5a8b62-ae43-4dde-b550-95848c7f9729"
                })
            })
        }
    }


})