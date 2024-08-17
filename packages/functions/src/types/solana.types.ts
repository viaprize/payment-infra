interface TokenBalanceChange {
    mint: string;
    rawTokenAmount: {
      decimals: number;
      tokenAmount: string;
    };
    tokenAccount: string;
    userAccount: string;
  }
  
  interface AccountData {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: TokenBalanceChange[];
  }
  
  interface Instruction {
    accounts: string[];
    data: string;
    innerInstructions: any[]; // Modify if inner instructions have a specific structure
    programId: string;
  }
  
  interface NativeTransfer {
    amount: number;
    fromUserAccount: string;
    toUserAccount: string;
  }
  
  interface TokenTransfer {
    fromTokenAccount: string;
    fromUserAccount: string;
    mint: string;
    toTokenAccount: string;
    toUserAccount: string;
    tokenAmount: number;
    tokenStandard: string;
  }
  
  interface NFTSaleEvent {
    amount: number;
    buyer: string;
    description: string;
    fee: number;
    feePayer: string;
    nfts: {
      mint: string;
      tokenStandard: string;
    }[];
    saleType: string;
    seller: string;
    signature: string;
    slot: number;
    source: string;
    staker: string;
    timestamp: number;
    type: string;
  }
  
  interface Events {
    nft?: NFTSaleEvent;
  }
  
export  interface TransactionData {
    accountData: AccountData[];
    description: string;
    events: Events;
    fee: number;
    feePayer: string;
    instructions: Instruction[];
    nativeTransfers: NativeTransfer[];
    signature: string;
    slot: number;
    source: string;
    timestamp: number;
    tokenTransfers: TokenTransfer[];
    transactionError: any | null; // Adjust if transactionError has a specific structure
    type: string;
  }
  