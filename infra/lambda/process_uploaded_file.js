import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "ap-southeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const s3Client = new S3Client()

export const handler = async event => {
  const s3Record = event.Records[0].s3

  console.log(s3Record)
  // First fetch metadata from S3
  const headObjectCommand = new HeadObjectCommand({
    Bucket: s3Record.bucket.name,
    Key: s3Record.object.key
  })
  const s3Object = await s3Client.send(headObjectCommand)
  if (!s3Object.Metadata) {
    // Shouldn't get here
    const errorMessage = "Cannot process photo as no metadata is set for it"
    console.error('errored', errorMessage, { s3Object, event })
    throw new Error(errorMessage)
  }

  // S3 metadata fields are all lowercase, so need to map them out carefully
  const photoDetails = {
    PhotoID: s3Object.Metadata.photoid,
    description: s3Object.Metadata.description,
    title: s3Object.Metadata.title,
    contentType: s3Object.ContentType,
    // Map the S3 bucket key to a CloudFront URL to be stored in the DB
    url: `https://dx75tjw7fhvsu.cloudfront.net/${s3Record.object.key}`
  }

  // Write to DynamoDB
  const command = new PutCommand({
    TableName: "Photos",
    Item: photoDetails
  });
  const response = await docClient.send(command);
  return {
    status: 200,
    ...response
  }; 
}
