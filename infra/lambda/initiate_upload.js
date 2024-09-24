import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { randomUUID as uuid } from 'crypto'

function getEnvString(key, required = false) {
  const val = process.env[key]
  if (required && !val) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return val
}
const BUCKET_NAME = getEnvString("S3_BUCKET_NAME", true)


// v--- Errors ---v

// Throw this error to have Lambda function return specific status code and error message in API Gateway response
export class StatusCodeError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
  }
}

// ^--- Errors ---^

// v--- Apigw ---v

function addCorsHeaders(response) {
  return {
    ...response,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    }
  }
}

/** Wraps all API Lambda handlers with common middleware */
export function wrap(handler) {
  return async (event, context) => {
    try {
      // make user context available to each request
      const result = await handler(event, context)
      return addCorsHeaders(result)
    } catch (e) {
      if (e instanceof StatusCodeError) {
        console.warn("StatusCodeError", { event, context }, e)
        return addCorsHeaders({
          statusCode: e.statusCode,
          body: JSON.stringify({
            error: e.message
          })
        })
      }
      console.error("Unhandled error", { event, context }, e)
      return addCorsHeaders({
        statusCode: 500,
        body: JSON.stringify({
          error: "Server error"
        })
      })
    }
  }
}

// ^--- Apigw ---^

// v--- Content Type ---v

const CONTENT_TYPE_SUFFIX_MAPPINGS = {
  "image/jpeg": "jpg",
  "image/svg+xml": "svg",
  "image/png": "png"
}

export function getSupportedContentTypes() {
  return Object.keys(CONTENT_TYPE_SUFFIX_MAPPINGS)
}

export function isValidImageContentType(contentType) {
  return Object.keys(CONTENT_TYPE_SUFFIX_MAPPINGS).includes(contentType)
}

export function getFileSuffixForContentType(contentType) {
  return CONTENT_TYPE_SUFFIX_MAPPINGS[contentType]
}

// ^--- Content Type ---^

export const handler = wrap(async photoMetadata => {
  const s3Client = new S3Client()

  // Read metadata from path/body and validate
  if (!isValidImageContentType(photoMetadata.contentType)) {
    throw new StatusCodeError(
      400,
      `Invalid contentType for image ${body.contentType}. Valid values are: ${getSupportedContentTypes().join(
        ","
      )}`
    )
  }
  // TODO: Add any further business logic validation here (e.g. that current user has write access to eventId)

  // Create the PutObjectRequest that will be embedded in the signed URL
  const photoId = uuid()
  const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key:  `uploads/${photoId}.${getFileSuffixForContentType(
        photoMetadata.contentType
      )}`,
      ContentType: photoMetadata.contentType,
      CacheControl: "max-age=3600", // instructs CloudFront to cache for 1 hour
      // Set Metadata fields to be retrieved post-upload and stored in DynamoDB
      Metadata: {
        ...photoMetadata,
        photoId
      }
    });

  // Get the signed URL from S3 and return to client
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 })
  return {
      statusCode: 201,
      signedUrl: signedUrl,
    };
})
