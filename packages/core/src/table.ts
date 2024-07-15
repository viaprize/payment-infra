export * as Table from "./table";
import { DynamoDB } from "aws-sdk";
import { Table } from "sst/node/table";



const dynamoDb = new DynamoDB.DocumentClient();
export const updateLatestHash = async (hash: string) => {
    return await dynamoDb.update({
        TableName:Table["wallet-hashes"].tableName,
        Key: {
          index: 0, // Provide only the partition key
        },
        UpdateExpression: "SET transactionHash = :hash",
        ExpressionAttributeValues: {
          ":hash": hash,
        },
      }).promise()
}

export const getLatestHash = async () => {
    const results = await dynamoDb.get({
        TableName:Table["wallet-hashes"].tableName,
       Key:{
          index:0
       }
      }).promise();
    
      console.log({results})
      return results.Item?.transactionHash
}