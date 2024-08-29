import { EventHandler } from "sst/node/event-bus";
import {Donation} from "@typescript-starter/core/donation"
import { Telegram } from "@typescript-starter/core/telegram";

const BITCOIN_ADDRESS = "bc1qjc68s72ssv98cdr76ay2g629cm60z83ssx5eyf"
// const BITCOIN_ADDRESS = "bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu"
// bc1qw8wrek2m7nlqldll66ajnwr9mh64syvkt67zlu

const SOLANA_ADDRESS = "2SRTxZEJbChYGQMJro8wCqTjVpvUc1QAcueb2tf97YGZ"

// const BASE_URL = "https://api-dev.viaprize.org"
const BASE_URL = "https://prod-api.viaprize.org"
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
        await fetch(`${BASE_URL}/api/prizes/extra_data/donations/ea2121a8-5801-4bc5-a74c-eb05068f4c36`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                donor: from,
                value: value,
                valueIn:asset,
                externalId: "ea2121a8-5801-4bc5-a74c-eb05068f4c36"
            })
        })
        
        if(asset === "USDC" || asset === "USDT"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/ea2121a8-5801-4bc5-a74c-eb05068f4c36`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsUsd: value,
                    externalId: "ea2121a8-5801-4bc5-a74c-eb05068f4c36",
                })
            })
        }
        else if (asset === "ETH"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/ea2121a8-5801-4bc5-a74c-eb05068f4c36`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInEth: value,
                    externalId: "ea2121a8-5801-4bc5-a74c-eb05068f4c36"
                })
            })
        }
        else if (asset === "BTC"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/ea2121a8-5801-4bc5-a74c-eb05068f4c36`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInBtc: value,
                    externalId: "ea2121a8-5801-4bc5-a74c-eb05068f4c36"
                })
            })
        }
        else if (asset === "SOL"){
            await fetch(`${BASE_URL}/api/prizes/extra_data/ea2121a8-5801-4bc5-a74c-eb05068f4c36`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fundsInSol: value,
                    externalId: "ea2121a8-5801-4bc5-a74c-eb05068f4c36"
                })
            })
        }
    }


})