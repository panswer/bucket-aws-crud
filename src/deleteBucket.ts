import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';
import httpJsonBodyParse from '@middy/http-json-body-parser';

interface RequestEvent {
    body: {
        bucketName?: string
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & RequestEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body || !event.body.bucketName) {
            return {
                statusCode: 412,
                body: JSON.stringify({
                    ok: false,
                    message: "The bucket's name is required"
                })
            }
        }

        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        await s3.deleteBucket({
            Bucket: event.body.bucketName
        }).promise();

        return {
            statusCode: 202,
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