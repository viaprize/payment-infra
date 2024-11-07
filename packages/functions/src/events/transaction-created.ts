import { EventHandler } from "sst/node/event-bus";
import { Wallet } from "@typescript-starter/core/wallet";
import {Telegram} from "@typescript-starter/core/telegram";
import {Table} from "@typescript-starter/core/table"
export const handler = EventHandler(Wallet.Events.Created, async (evt) => {
  await Table.updateLatestHash(evt.properties.hash)

  console.log({evt})

  console.log(JSON.stringify(evt))

  
  
  if(evt.properties.type === "reserve"){
    const amount_usdc_unformated = await Wallet.getTokenBalance(
      Wallet.getUsdcAddress(evt.properties.chainId),
      evt.properties.type,
      evt.properties.chainId
    )
    const amount_usdc = parseFloat(amount_usdc_unformated.toString()) / 1_000_000;
    
  
    
    if(amount_usdc < 2000){
      await Telegram.sendMessage({
        chatId: "-948252043",
        text: `
Low reserve balance on chain ${evt.properties.chainId}, 
current amount ${amount_usdc} USDC, 
send to ${Wallet.getAddress(evt.properties.type)} to top up reserve wallet
        `
      })
    }

    const amount_eth_unformated = await Wallet.getTokenBalance(
      "eth",
      evt.properties.type,
      evt.properties.chainId,
      true
    )
    const amount_eth = parseFloat(amount_eth_unformated.toString()) / 1_000_000_000_000_000_000;

    if(amount_eth <= 0.0002){
      await Telegram.sendMessage({
        chatId: "-948252043",
        text: `
Low reserve balance on chain ${evt.properties.chainId}, 
current amount ${amount_eth} ETH, 
send to ${Wallet.getSignerAddress(evt.properties.type)} to top up
        `
      })
    }

    
  }
  else if(evt.properties.type === "gasless"){
    const amount_eth_unformated = await Wallet.getTokenBalance(
      "eth",
      evt.properties.type,
      evt.properties.chainId,
      true
    )
    console.log({amount_eth_unformated},"JSKjflsdj")
   
    const amount_eth = parseFloat(amount_eth_unformated.toString()) / 1_000_000_000_000_000_000;
    console.log({amount_eth},"JSKjflsdj")
    if(amount_eth <= 0.02){
      console.log("hiiii in amount low")
      await Telegram.sendMessage({
        chatId: "-948252043",
        text: `
Low reserve balance on chain ${evt.properties.chainId},
current amount ${amount_eth} ETH, 
send to ${Wallet.getSignerAddress(evt.properties.type)} to top up gasless wallet
        `
      })
    }
    console.log("hiiiiii this is it")
  }

  
});

