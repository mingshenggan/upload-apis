import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

function getEnvString(key, required = false) {
  const val = process.env[key]
  if (required && !val) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return val
}
const DYDB_TABLE_NAME = getEnvString("DYDB_TABLE_NAME", true)

export const handler = async request => {
  const command = new ScanCommand({
    TableName: DYDB_TABLE_NAME,
  });

  const response = await docClient.send(command)
  console.log(response)
  return {
    Status: 200,
    Count: response.Count,
    Items: response.Items,
  }
}
