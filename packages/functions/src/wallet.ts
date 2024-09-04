
import { Wallet } from "@typescript-starter/core/wallet";
import { ApiHandler } from "sst/node/api";

export const generate = ApiHandler(async (_evt) => {
    const key = Wallet.generateEncryptedPrivateKey()
    const address = Wallet.generateAddressFromEncryptedPrivateKey(key);
    console.log("address", address)

    return {
        statusCode: 200,
        body: JSON.stringify({ address, key }),
    }
})

