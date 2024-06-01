// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  LANGUAGE_URL: 'http://localhost:4201',
  BASE_URL: 'http://localhost:3001/', // master service it should be 3000
  ADMISSION_BASE_URL: 'http://localhost:3001/', // admission service
  PAYMENT_BASE_URL: 'http://localhost:3002/',
  FRONTEND_BASE_URL: 'http://3.108.242.79:3004/',
  CHATBOX_BASE_URL: 'http://localhost:3006/',
  GENQE_BASE_URL: 'http://localhost:3007/',
  AWS_AUTHENTICATION_URL: 'http://localhost:3201/',
  BOOKING_SERVICE_URL: 'https://dev-us-lms-backendapi.plaza-network.com/',
  JAVA_SERVICE_URL: 'http://3.108.242.79:8082/',
  apiUrl: '',
  CAPTCHA_SITE_KEY: '6Ld2FWMbAAAAAOihjNYFYT-NVK85FJZPGQ6pOMk3',
  PUBLIC_BUCKET_NAME: 'ppg-lms',
  STRIPE_KEY: 'pk_test_51HoiQxEcZxb3oqUAyx9lnFu6UAwK7CUy3Js7jPjNedDo3QYlIvRYzFk4M7qloEW6wqlnmOOQrOJKMqearL047LZA00V6CfueB4',
  BUILDNUM: '1.3.11',
  DESK_COUNT: 2
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
