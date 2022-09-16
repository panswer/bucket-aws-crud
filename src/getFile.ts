import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';

interface RequestEvent {
    pathParameters: {
        key: string,
        bucket: string
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & RequestEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { key, bucket } = event.pathParameters;

        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        const file = await s3.getObject({
            Key: key,
            Bucket: bucket
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify(file.Body)
        }
    } catch (error) {
        return {
            statusCode: 422,
            body: JSON.stringify({
                message: error.message
            })
        }
    }
}

export const handler = middy(lambdaHandler)