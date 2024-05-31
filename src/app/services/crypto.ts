import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
// import { KMSClient, EncryptCommand, CancelKeyDeletionCommand } from '@aws-sdk/client-kms';
import decode from 'jwt-decode';

@Injectable(
    {
        providedIn: 'root'
    }
)

export class Crypto {
    // public client = new KMSClient({ 
    //     credentials: {
    //         accessKeyId: 'AKIA5RXCGCFAWFCOTHUU',
    //         secretAccessKey: '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'
    //     },
    //     region: 'ap-south-1' });
    constructor() { }

    public async encrypt(data: any): Promise<any> {
        // const command = new EncryptCommand({
        //     KeyId: '5755cb40-fd44-4252-8895-6d60b9067f99',
        //     Plaintext: new TextEncoder().encode(JSON.stringify(data)),
        //     EncryptionAlgorithm: 'RSAES_OAEP_SHA_256'
        // });
        // const response = await this.client.send(command);
        // return response.CiphertextBlob.toString();
        return 'some encryption';
    }

    public decrypt(data: string, key: any): any {
        try {
            key = key
            .replace('-----BEGIN PUBLIC KEY-----', '')
            .replaceAll('\n', '')
            .replace('-----END PUBLIC KEY-----', '');
            const bytes = CryptoJS.AES.decrypt(data, key);
            if (bytes.toString()) {
                return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            }
            return data;
        } catch (e) {
            console.log(e);
        }
    }

    public kmsDecrypt(data): any {
        return decode(data);
    }
}
