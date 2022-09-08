import middy from "@middy/core";
import httpMultipartBodyParser from '@middy/http-multipart-body-parser';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from 'aws-sdk';

interface RequestEvent {
    body: {
        bucketName?: string,
        image: {
            filename: string,
            mimetype: string,
            encoding: string,
            truncated: boolean,
            content: Buffer
        }
    }
}

const lambdaHandler = async (event: APIGatewayProxyEvent & RequestEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.body.bucketName) {
            return {
                statusCode: 412,
                body: JSON.stringify({
                    ok: false,
                    message: "Which bucket do yout want to use?"
                })
            }
        }

        if (!event.body.image) {
            return {
                statusCode: 412,
                body: JSON.stringify({
                    ok: false,
                    message: "The file is required"
                })
            }
        }

        AWS.config.update({
            region: 'us-west-2'
        });

        let s3 = new AWS.S3({
            apiVersion: '2006-03-01'
        });

        let newFile = await s3.upload({
            Bucket: event.body.bucketName,
            Key: event.body.image.filename,
            Body: event.body.image.content
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({
                ok: true,
                filePath: newFile.Location
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
    .use(httpMultipartBodyParser());