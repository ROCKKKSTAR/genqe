import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FingerprintService {

  constructor() { }

  async registerFingerprint(user): Promise<any> {
    if (!('PublicKeyCredential' in window)) {
      console.error('WebAuthn is not supported');
      return;
    }

    try {
      let publicKey:any = {
         challenge: new Uint8Array(/* challenge bytes */),
         rp: { name: 'csimplifyit.com' },
        user: {
          id: new TextEncoder().encode('1345'),
          name: user.name,
           displayName: user.name
        },
        algorithms:[
          "es256",
          "rs256"
        ],
        discoverable_credential: "preferred",
        pubKeyCredParams: [{
          type: 'public-key',
          alg: -7 // COSE algorithm for ES256
        }],
        user_verification:"preferred",
        timeout: 60000,
        attestation: 'none'
      };

      const newCredentialInfo = await navigator.credentials.create({ publicKey })

      console.log("Register",newCredentialInfo);
      return newCredentialInfo;
      // Handle the new credential info, e.g., send it to your backend
    } catch (error) {
      console.error('Error registering fingerprint:', error);
    }
  }

  async authenticateFingerprint(): Promise<any> {
    if (!('PublicKeyCredential' in window)) {
      console.error('WebAuthn is not supported');
      return;
    }

    try {
      const publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(
            'randomStringFromServer', c => c.charCodeAt(0)),
        rp: {
            name: "csimplifyit",
            id: "csimplifyit.com",
        },
        user: {
            id: Uint8Array.from(
                "UZSL85T9AFC", c => c.charCodeAt(0)),
            name: "LoginUser",
            displayName: "LoginUser",
        },
        pubKeyCredParams: [
            {
                alg: -7, // COSE algorithm for ES256
                type: "public-key" as "public-key" // Explicitly typed as "public-key"
            }
        ],
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform" as AuthenticatorAttachment
        },
        timeout: 60000,
        attestation: "direct" as AttestationConveyancePreference
    };
    
    const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialCreationOptions
    });
    console.log("Authenticate",credential);

    return credential
  
      // const assertion = await navigator.credentials.get({ publicKey });
      // Handle successful authentication, e.g., log the user in
    } catch (error) {
      console.error('Error authenticating fingerprint:', error);
    }
  }
}