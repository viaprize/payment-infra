export * as Telegram from "./telegram";
import {Telegram} from "puregram"
import { Config } from "sst/node/config";
const telegram = Telegram.fromToken(Config.TELEGRAM_BOT_TOKEN)

export const sendMessage = async ({chatId,text}:{chatId: string | number , text: string}) => {
    await telegram.api.sendMessage({
        chat_id: chatId,
        text,

    })
}