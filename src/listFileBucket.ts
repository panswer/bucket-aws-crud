import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

interface EventRequest {
    pathParameters: {
        bucket: string
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & EventRequest): Promise<APIGatewayProxyResult> => {
    try {
        let { bucket } = event.pathParameters;

        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        let fileList = await s3.listObjects({
            Bucket: bucket
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(fileList)
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

export const handler = middy(lambdaHandler);