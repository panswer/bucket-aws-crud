import middy from "@middy/core";
import { APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';

const lambdaHandler = async (): Promise<APIGatewayProxyResult> => {
    try {
        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

        let bucketList = await s3.listBuckets().promise();

        return {
            statusCode: 200,
            body: JSON.stringify(bucketList.Buckets)
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

export const handler = middy(lambdaHandler);