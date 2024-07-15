import { StackContext, Api, EventBus, Config, Table, Cron, RDS } from "sst/constructs";

export function API({ stack }: StackContext) {

  const GASLESS_API_KEY = new Config.Secret(stack, "GASLESS_API_KEY");
  const RESERVE_KEY = new Config.Secret(stack, "RESERVE_KEY")
  const OP_RPC_URL = new Config.Secret(stack, "OP_RPC_URL")
  const GASLESS_KEY = new Config.Secret(stack, "GASLESS_KEY")
  const PAYMENT_API_KEY = new Config.Secret(stack, "PAYMENT_API_KEY")
  const PAYMENT_WEBHOOK_SECRET = new Config.Secret(stack,"PAYMENT_WEBHOOK_SECRET")
  const SUPABASE_URL = new Config.Secret(stack,"SUPABASE_URL")
  const SUPABASE_ANON_KEY  = new Config.Secret(stack,"SUPABASE_ANON_KEY")
  const BASE_RPC_URL = new Config.Secret(stack,"BASE_RPC_URL")
  const TESTMODE_PAYMENT_API_KEY = new Config.Secret(stack,"TESTMODE_PAYMENT_API_KEY");
  const TESTMODE_PAYMENT_WEBHOOK_SECRET = new Config.Secret(stack,"TESTMODE_PAYMENT_WEBHOOK_SECRET")
  const TELEGRAM_BOT_TOKEN = new Config.Secret(stack,"TELEGRAM_BOT_TOKEN")
  const PAYMENT_SECRET_KEY = new Config.Secret(stack,"PAYMENT_SECRET_KEY")

  const table = new Table(stack, "wallet-hashes", {
    fields: {
      index:"number",
      transactionHash: "string",
      
    },
    
    primaryIndex: { partitionKey: "index" },
  });
  const bus = new EventBus(stack, "wallet-bus", {
    defaults: {
      retries: 10,
    },
  });

  const cron = new Cron(stack, "Cron", {
    schedule: "rate(2 minutes)",
    job: "packages/functions/src/cron/lambda.handler",
    

  });

  cron.bind([TELEGRAM_BOT_TOKEN])

  const api = new Api(stack, "wallet-api", {
    defaults: {
      function: {
        bind: [bus,table,cron, GASLESS_API_KEY, RESERVE_KEY, OP_RPC_URL, GASLESS_KEY, PAYMENT_API_KEY,PAYMENT_WEBHOOK_SECRET,SUPABASE_URL,SUPABASE_ANON_KEY,BASE_RPC_URL,TESTMODE_PAYMENT_API_KEY,TESTMODE_PAYMENT_WEBHOOK_SECRET,TELEGRAM_BOT_TOKEN,PAYMENT_SECRET_KEY],
        timeout:130
      },
      
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /gasless/address": "packages/functions/src/gasless.get",
      "GET /gasless/signer": "packages/functions/src/gasless.getSigner",
      "POST /gasless": "packages/functions/src/gasless.create",
      "GET /reserve/address": "packages/functions/src/reserve.get",
      "GET /reserve/signer": "packages/functions/src/reserve.getSigner", 
      "GET /reserve/balance": "packages/functions/src/reserve.getBalance",
      "GET /reserve/hash": "packages/functions/src/reserve.getHash",
      
      "POST /reserve": "packages/functions/src/reserve.create",
      "POST /checkout": "packages/functions/src/checkout.create",
      "POST /checkout/webhook": "packages/functions/src/checkout.webhook",
      "POST /checkout/refund": "packages/functions/src/checkout.triggerRefundEvent",
      // "POST /checkout/test": "packages/functions/src/checkout.createTestCheckout",
      // "POST /checkout/test/webhook": "packages/functions/src/checkout.webhookTest",
    },
  });

  bus.subscribe("wallet.transaction", {
    handler: "packages/functions/src/events/transaction-created.handler",
    bind:[table,TELEGRAM_BOT_TOKEN,OP_RPC_URL,BASE_RPC_URL,GASLESS_KEY,RESERVE_KEY]
  });
 
  bus.subscribe("checkout.refunded",{
    handler:"packages/functions/src/events/checkout-refunded.handler",
    bind:[table,OP_RPC_URL,BASE_RPC_URL,SUPABASE_ANON_KEY,SUPABASE_URL,PAYMENT_API_KEY,PAYMENT_WEBHOOK_SECRET,PAYMENT_SECRET_KEY]
  })
  stack.addOutputs({
    ApiEndpoint: api.url,
    
  });
}
