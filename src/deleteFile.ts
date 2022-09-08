import middy from "@middy/core";
import httpJsonBodyParse from '@middy/http-json-body-parser'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';

interface RequestEvent {
    body: {
        key: string
    },
    pathParameters: {
        bucket: string
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & RequestEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { bucket } = event.pathParameters;

        if (!event.body || !event.body.key) {
            return {
                statusCode: 412,
                body: JSON.stringify({
                    ok: false,
                    message: "The key is required"
                })
            }
        }

        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        await s3.deleteObject({
            Bucket: bucket,
            Key: event.body.key
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true
            })
        }
    } catch (error) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                ok: false,
                message: error.message
            })
        }
    }
}

export const handler = middy(lambdaHandler)
    .use(httpJsonBodyParse());