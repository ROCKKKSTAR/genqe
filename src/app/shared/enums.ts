export enum cognitoObjectDEV {
    loginUrl = 'https://plazaauth.auth.ap-southeast-1.amazoncognito.com/login?client_id=6espefj2rv3nspa09adkg2m4r2&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=http://localhost:4200/dashboard',
    logoutURL = 'https://plazaauth.auth.ap-southeast-1.amazoncognito.com/logout?client_id=6espefj2rv3nspa09adkg2m4r2&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&logout_uri=http://localhost:4300'
}
export enum cognitoObjectPROD {
    // loginUrl = 'https://lms-uat.plaza-network.com/',
    // logoutURL = 'https://lms-uat.plaza-network.com/'
    loginUrl = 'https://plazaauth.auth.ap-southeast-1.amazoncognito.com/login?client_id=6espefj2rv3nspa09adkg2m4r2&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://market-api.com/dashboard',
    logoutURL = 'https://plazaauth.auth.ap-southeast-1.amazoncognito.com/login?client_id=6espefj2rv3nspa09adkg2m4r2&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://market-api.com/login'
}
// declar all enums

// Auth local pre approved user
// export enum cognitoObjectDEV {
//     loginUrl = 'http://localhost:4200/',
//     logoutURL = 'http://localhost:4300/'
// }

// export enum cognitoObjectPROD {
//     // loginUrl = 'https://lms-uat.plaza-network.com/',
//     // logoutURL = 'https://lms-uat.plaza-network.com/'
//     loginUrl = 'https://market-api.com:2200/',
//     logoutURL = 'https://market-api.com:2200/'
// }

