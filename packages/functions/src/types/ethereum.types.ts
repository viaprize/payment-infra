interface RawContract {
    rawValue: string;
    address?: string;
    decimals: number;
  }
  
  interface Log {
    address: string;
    topics: string[];
    data: string;
    blockNumber: string;
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    logIndex: string;
    removed: boolean;
  }
  
  interface Activity {
    fromAddress: string;
    toAddress: string;
    blockNum: string;
    hash: string;
    value: number;
    asset: string;
    category: string;
    rawContract: RawContract;
    log?: Log;
  }
  
  interface Event {
    network: string;
    activity: Activity[];
  }
  
 export  interface WebhookEvent {
    webhookId: string;
    id: string;
    createdAt: string;
    type: string;
    event: Event;
  }