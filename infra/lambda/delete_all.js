import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand, DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client({})
const DYDB_TABLE_NAME = "Photos"

export const handler = async request => {
  const command = new ScanCommand({
    TableName: DYDB_TABLE_NAME,
  });

  const response = await docClient.send(command)

  let deleted = []
  for (var i in response.Items) {
    var record = response.Items[i]
    await s3Client.send(new DeleteObjectCommand({
      Bucket: "upload-apis-bucket",
      Key: `uploads/${record.PhotoID}`
    }))
    await docClient.send(new DeleteCommand({
      TableName: DYDB_TABLE_NAME,
      Key: { PhotoID: record.PhotoID }
    }))
    deleted.push(record.PhotoID)
  }
  return { status: 200, deleted }
}
