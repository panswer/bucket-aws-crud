import middy from "@middy/core";
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';

interface RequestEvent {
    body: {
        name: string | undefined
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & RequestEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body.name) {
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

        let newBucket = await s3.createBucket({
            Bucket: event.body.name
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                bucket: newBucket.Location
            })
        }
    } catch (error) {
        return {
            statusCode: 412,
            body: JSON.stringify({
                ok: false,
                message: error.message
            })
        }
    }
}

export const handler = middy(lambdaHandler)
    .use(httpJsonBodyParser());