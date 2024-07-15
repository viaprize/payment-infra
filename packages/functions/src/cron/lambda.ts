import { Wallet } from "@typescript-starter/core/wallet";
import { Telegram } from "@typescript-starter/core/telegram";
export async function handler() {
    const a = await  fetch("https://viaprize.org/")
    console.log(a.status)
    if(a.status !== 200){
        await Telegram.sendMessage({
            chatId: "-948252043",
            text: `Website is ${a.status === 200 ? "up" : "down"}`
        })
    }
    
} 