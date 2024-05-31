
export const REG_EX = {
  email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  website: /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
  number: /^(0|[0-9][0-9]*)$/,
  
  decimalTillTwo: /^[0-9]\d{0,50}(\.\d{1,2})?%?$/,
  decimaltillthree:/^[0-9]{1,11}(?:\.[0-9]{1,3})?$/,  
  inputKeyPressNumber: /[0-9]/,
  pan_number: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/,
  gst: /^[0-9]{2}[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}[1-9A-Za-z]{1}Z[0-9A-Za-z]{1}$/,
  alphaNumeric: /^[a-zA-Z0-9\.]*$/,
  // alphabate: /^[a-zA-Z ]*$/, 
  alphabate: /^[A-Za-z _.-]{0,60}$/,
  alphabates: /^[A-Za-z_.-]{0,60}$/, 
  percentage: /^[0-9]+(\.[0-9]{1,2})?$/,
  Mobile: /^[0-9]{10}$/,
  DigitNumber : /^([1-9]{1}[0-9]*)$/,
  NoSpace: /^[^0-9]{0}([a-zA-Z0-9/])+[a-zA-Z0-9/]+$/,
  name:/^[A-Za-z]{1}[A-Za-z _.-]{0,60}/,
  vechile: /^([a-zA-Z]{2}[0-9a-zA-Z]*)$/
};
