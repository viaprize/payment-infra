interface TransactionInput {
    txid: string;
    vout: number;
    sequence: number;
    n: number;
    addresses: string[];
    isAddress: boolean;
    isOwn: boolean;
    value: string;
  }
  
  interface TransactionOutput {
    value: string;
    n: number;
    hex: string;
    addresses: string[];
    isAddress: boolean;
    isOwn?: boolean;
  }
  
  interface CoinSpecificVin {
    txid: string;
    vout: number;
    scriptSig: {
      asm: string;
      hex: string;
    };
    txinwitness: string[];
    sequence: number;
  }
  
  interface CoinSpecificVout {
    value: number;
    n: number;
    scriptPubKey: {
      asm: string;
      desc: string;
      hex: string;
      address: string;
      type: string;
    };
  }
  
  interface CoinSpecificData {
    txid: string;
    hash: string;
    version: number;
    size: number;
    vsize: number;
    weight: number;
    locktime: number;
    vin: CoinSpecificVin[];
    vout: CoinSpecificVout[];
    hex: string;
  }
  
  interface Transaction {
    txid: string;
    version: number;
    vin: TransactionInput[];
    vout: TransactionOutput[];
    blockHeight: number;
    confirmations: number;
    confirmationETABlocks: number;
    confirmationETASeconds: number;
    blockTime: number;
    size: number;
    vsize: number;
    value: string;
    valueIn: string;
    fees: string;
    hex: string;
    coinSpecificData: CoinSpecificData;
  }
  
 export  interface TransactionData {
    txs: number;
    balance: string;
    address: string;
    totalSent: string;
    unconfirmedTxs: number;
    unconfirmedBalance: string;
    transactions: Transaction[];
  }