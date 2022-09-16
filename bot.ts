// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// var speakeasy = require('speakeasy');
// var useragent = require('useragent');
// const emailSplit = require('email-split');
// const { isEmpty, result, isElement, set } = require('lodash');
// const logger = require('../../logger')('accountApiController.js');
// let message_config = require('../../messageConfigs/message.json');
// const error_config = require('../../messageConfigs/errors.json');
// const userModel = require('../../dbConnection/schema-models/users-model/operation');
// const merchantCoinModel = require('../../dbConnection/schema-models/merchantCoin-model/operation');
// const HotWalletModel = require('../../dbConnection/schema-models/merchantHotWallet-model/operation');
// const notificationModel = require('../../dbConnection/schema-models/notificationSetting-model/operation');
// const verificationModel = require('../../dbConnection/schema-models/verification-model/operation');
// const settingsModel = require('../../dbConnection/schema-models/setting-model/operation');
// const emailFormatModel = require('../../dbConnection/schema-models/emailFormat-model/operation');
// const loginLogModel = require('../../dbConnection/schema-models/loginLog-model/operation');
// const coinsModel = require('../../dbConnection/schema-models/coin-model/operation');
// const { DISABLE_COINS } = require('../../HelperServices/conditonsCoinsList');
// const { MAIL_TYPE } = require('../../emailService/EmailTypeEnum');
// const QRCode = require('qrcode'); //required for converting otp-url to dataUrl
// const { Logform } = require('winston');

// class AuthorizationApiController {
//     constructor({
//         podId,
//         cryptoService,
//         databaseOperations,
//         platformHelperFunction,
//         emailService,
//         mobileService,
//         encryptDecrypt,
//     }) {
//         this.podId = podId;
//         this.cryptoService = cryptoService;
//         this.encryptDecrypt = encryptDecrypt;
//         this.databaseOperations = databaseOperations;
//         this.emailService = emailService;
//         this.mobileService = mobileService;
//         this.platformHelperFunction = platformHelperFunction;
//         this.createBindings();
//     }
//     createBindings() {
//         this.loginValidation = this.loginValidation.bind(this);
//         this.registerValidation = this.registerValidation.bind(this);
//         this.logIn = this.logIn.bind(this);
//         this.register = this.register.bind(this);
//         this.forgetPassword = this.forgetPassword.bind(this);
//         this.restPassword = this.restPassword.bind(this);
//         this.sentlogin2faCode = this.sentlogin2faCode.bind(this);
//         this.mobile2faVerification = this.mobile2faVerification.bind(this);
//         this.email2faVerification = this.email2faVerification.bind(this);
//         this.google2faVerification = this.google2faVerification.bind(this);
//         this.activateRegisterEmail = this.activateRegisterEmail.bind(this);
//         this.sendOtpOnMobile = this.sendOtpOnMobile.bind(this);
//         this.verifiyMobileCode = this.verifiyMobileCode.bind(this);
//     }

//     async loginValidation(user, response) {
//         // Check user enter email or Mobile number

//         if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user)) {
//             var email = user.toLowerCase();
//             var auth = { email: email };
//             var authtype = 'emailtype';
//         } else {
//             var auth = { contact_number: user };
//             var authtype = 'mobiletype';
//         }
//         //End Check user enter email or Mobile number
//         let isVerifiy = await verificationModel.FindOne({ verify_id: 5, status: 0 });

//         if (!isEmpty(isVerifiy)) {
//             response.code = message_config.error.disable_login.code;
//             response.message = message_config.error.disable_login.message;
//             return { isExistUser: null, authtype, response };
//         }

//         //Check User EXIST OR NOT
//         let isExistUser = await userModel.FindOne(auth);
//         if (isEmpty(isExistUser)) {
//             response.code = message_config.error.user_not_found.code;
//             response.message = message_config.error.user_not_found.message;
//             return { isExistUser: null, authtype, response };
//         }
//         if (isExistUser.status === false) {
//             response.code = message_config.error.disable_temporary_login.code;
//             response.message = message_config.error.disable_temporary_login.message;
//             return { isExistUser: null, authtype, response };
//         }
//         return { isExistUser, authtype, response };
//     }

//     // GET USER PROFILE DATA-------
//     async logIn(req, res) {
//         const FUNCTION_NAME = 'logIn';
//         let { user, password, mobile_app } = req.body;
//         let response = {
//             status: 'error',
//             message: null,
//             code: 200,
//             data: [],
//             error: null,
//         };

//         if (isEmpty(user) || isEmpty(password)) {
//             response.code = message_config.error.missing_parameter.code;
//             response.message = message_config.error.missing_parameter.message;
//             logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//             res.status(200).json(response);
//             return res.end();
//         }

//         try {
//             let { isExistUser, authtype, response: resp } = await this.loginValidation(user, response);
//             if (isEmpty(isExistUser)) {
//                 logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, resp);
//                 res.status(200).json({ data: resp });
//                 return res.end();
//             }
//             let {
//                 _id,
//                 email,
//                 activation_code,
//                 firstname,
//                 lastname,
//                 contact_number,
//                 email_2fa,
//                 mobile_2fa,
//                 google_2fa,
//                 referer_code,
//                 ref_balance,
//                 companyLogo,
//                 companyName,
//                 email_active,
//                 mobile_active,
//                 phone_verifiy,
//             } = isExistUser;

//             //COMPAIRE INPUT PASSWORD WITH DB PASSWORD
//             if (bcrypt.compareSync(password, isExistUser.password)) {
//                 //GENRATE LOGIN JWT TOKEN
//                 const token = jwt.sign({
//                         user_id: _id,
//                         email: email,
//                         contact_number,
//                         firstname,
//                         lastname,
//                     },
//                     process.env.JWT_SECRET_KEY, { expiresIn: '7d' },
//                 );

//                 // GENRATE MERCHANT WALLET WHILE LOGIN
//                 coinsModel.Find({ coin_code: { $nin: DISABLE_COINS } }, (coinerr, coindoc) => {
//                     if (coindoc.length > 0) {
//                         for (var i = 0; i < coindoc.length; i++) {
//                             if (!mobile_app && mobile_app != '1') {
//                                 // merchant_insert(coindoc[i], _id);
//                                 // merchant_hot_wallet_insert(coindoc[i], _id);
//                             }
//                         }
//                     }
//                 });

//                 //CHECK MERCHANT USER IS ACTIVATED ON NOT
//                 if (authtype == 'mobiletype') {
//                     if (phone_verifiy == false) {
//                         response.code = 200;
//                         response.message = 'Your mobile number is not verifiyed, Please try again with email.';
//                         response.error = 'Your mobile number is not verifiyed, Try another way.';
//                         res.status(200).json(response);
//                         return res.end();
//                     }
//                 } else {
//                     //IF USER EMAIL IS NOT ACTIVE:
//                     if (email_active == false) {
//                         try {
//                             const isSeting_1 = await settingsModel.FindOne({ setting_id: 1 });
//                             const isSeting_2 = await settingsModel.FindOne({ setting_id: 2 });

//                             if (isEmpty(isSeting_1) || isEmpty(isSeting_2)) {
//                                 response.code = message_config.error.failed_to_get_setting.code;
//                                 response.message = message_config.error.failed_to_get_setting.message;
//                                 logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                                 res.status(200).json(response);
//                                 return res.end();
//                             }

//                             let maildata = {
//                                 firstname,
//                                 link: `${isSeting_2.setting_value}api/activate_email/${activation_code}`,
//                                 email: email.toLowerCase(),
//                             };

//                             //SEND REGISTER MAIL AGAIN
//                             this.emailService
//                                 .send_Mail(req, MAIL_TYPE.REGISTRATION_EMAIL, maildata)
//                                 .then((result) => {
//                                     if (!result) {
//                                         response.code = 200;
//                                         response.message = 'Your email is not activated, Please try again.';
//                                         res.status(200).json(response);
//                                         return res.end();
//                                     }

//                                     response.code = message_config.error.activate_email.code;
//                                     response.message = message_config.error.activate_email.message;
//                                     res.status(200).json(response);
//                                     return res.end();
//                                 })
//                                 .catch((err) => {
//                                     response.code = message_config.error.fail_activate_email.code;
//                                     response.message = message_config.error.fail_activate_email.message;
//                                     response.error = err;
//                                     logger.error(
//                                         '(%s) - podId=[%s] - Response=[%o]',
//                                         FUNCTION_NAME,
//                                         this.podId,
//                                         response,
//                                     );
//                                     res.status(200).json(response);
//                                     return res.end();
//                                 });
//                         } catch (error) {
//                             response.code = message_config.error.fail_activate_email.code;
//                             response.message = message_config.error.fail_activate_email.message;
//                             response.error = error;
//                             logger.error('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         }
//                     }
//                 }

//                 //<--------AFTER EMAIL OR MOBILE IS ACTIVATED---------->>

//                 contact_number = contact_number.toString();

//                 let responseResult = {
//                     _id,
//                     email,
//                     contact_number,
//                     firstname,
//                     lastname,
//                     google_2fa,
//                     email_2fa,
//                     mobile_2fa,
//                     referer_code,
//                     ref_balance,
//                     companyLogo,
//                     companyName,
//                 };

//                 if (mobile_2fa === 'enable' || email_2fa === 'enable') {
//                     const AfterSendCode = await this.sentlogin2faCode(req, mobile_2fa, email_2fa, isExistUser);
//                     if (AfterSendCode == false) {
//                         response.code = 200;
//                         response.message = 'Login Successfully. There is error in sending 2FA authentication code.';
//                         res.status(200).json(response);
//                         return res.end();
//                     }

//                     var agent = useragent.parse(req.headers['user-agent']);
//                     let save_login_log = {
//                         user_id: isExistUser._id,
//                         email: isExistUser.email,
//                         login_datetime: new Date(),
//                         browser: agent.toAgent(),
//                         login_ip:
//                             (req.headers['x-forwarded-for'] || '').split(':').pop() ||
//                             req.connection.remoteAddress.split(':').pop(),
//                         access_token: token,
//                     };
//                     await loginLogModel
//                         .Create(save_login_log)
//                         .then(async(result) => {
//                             //SEND NOTIFICATION LOGIN MAIN
//                             if (!isEmpty(await notificationModel.FindOne({ notificationsetting_id: 2, status: true })))
//                                 this.emailService.send_Mail(req, MAIL_TYPE.EMAIL_2FA, {
//                                     email,
//                                     firstname,
//                                     ipaddress: save_login_log.login_ip,
//                                 });

//                             //ADD TOKEN IN REPONSE
//                             responseResult.access_token = token;
//                             response.status = 'success';
//                             response.message = 'Login Successfull Verify your Mobile 2FA';
//                             response.data = [responseResult];
//                             logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         })
//                         .catch((error) => {
//                             response.message = 'Failed to login, Please retry';
//                             response.error = error.toString();
//                             logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         });
//                 } else {
//                     var agent = useragent.parse(req.headers['user-agent']);
//                     let save_login_log = {
//                         user_id: isExistUser._id,
//                         email: isExistUser.email,
//                         login_datetime: new Date(),
//                         browser: agent.toAgent(),
//                         login_ip:
//                             (req.headers['x-forwarded-for'] || '').split(':').pop() ||
//                             req.connection.remoteAddress.split(':').pop(),
//                         access_token: token,
//                     };
//                     await loginLogModel
//                         .Create(save_login_log)
//                         .then(async(result) => {
//                             //SEND NOTIFICATION LOGIN MAIN
//                             if (!isEmpty(await notificationModel.FindOne({ notificationsetting_id: 2, status: true })))
//                                 this.emailService.send_Mail(req, MAIL_TYPE.EMAIL_2FA, {
//                                     email,
//                                     firstname,
//                                     ipaddress: save_login_log.login_ip,
//                                 });

//                             //ADD TOKEN IN REPONSE
//                             responseResult.access_token = token;
//                             response.status = 'success';
//                             response.message = 'You are login Successfully';
//                             response.data = [responseResult];
//                             logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         })
//                         .catch((error) => {
//                             response.message = 'Failed to login, Please retry';
//                             response.error = error.toString();
//                             logger.error('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         });
//                 }
//             } else {
//                 response.code = 200;
//                 response.message = 'User is not authorized please check your password';
//                 res.status(200).json(response);
//                 return res.end();
//             }
//         } catch (error) {
//             response.code = message_config.error.something_wrong.code;
//             response.message = message_config.error.something_wrong.message;
//             response.error = error.toString();
//             logger.error('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, error);
//             res.status(200).json(response);
//             return res.end();
//         }
//     }

//     async registerValidation(email, password, user_name, confirm_password, mobile, country_code, phone_verifiy) {
//         if (!email)
//             return {
//                 valid: false,
//                 code: message_config.error.Invalid_email.code,
//                 message: message_config.error.Invalid_email.message,
//             };
//         if (!password || !confirm_password || !user_name)
//             return {
//                 valid: false,
//                 code: message_config.error.Invalid_username_password.code,
//                 message: message_config.error.Invalid_username_password.message,
//             };
//         if (password != confirm_password)
//             return {
//                 valid: false,
//                 code: message_config.error.Invalid_username_password.code,
//                 message: message_config.error.Invalid_username_password.message,
//             };

//         // if User enter Mobile number-------
//         if (!isEmpty(mobile)) {
//             if (country_code == null)
//                 return {
//                     valid: false,
//                     code: message_config.error.country_code_invalid.code,
//                     message: message_config.error.country_code_invalid.message,
//                 };
//             if (!phone_verifiy)
//                 return {
//                     valid: false,
//                     code: message_config.error.verifiy_mobile.code,
//                     message: message_config.error.verifiy_mobile.message,
//                 };
//         }
//         return { valid: true };
//     }

//     async register(req, res) {
//         const FUNCTION_NAME = 'register';
//         let response = {
//             status: 'error',
//             message: null,
//             code: 200,
//             data: [],
//             error: null,
//         };
//         let {
//             email,
//             country_code,
//             user_name,
//             password,
//             confirm_password,
//             mobile,
//             ref_code,
//             phone_verifiy,
//             ISO_letter,
//         } = req.body;
//         let unique_id = Date.now();
//         const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//         try {
//             const isCheckSetting = await notificationModel.FindOne({ notificationsetting_id: 1, status: 0 });
//             if (isCheckSetting) {
//                 response.code = message_config.error.user_not_found.message;
//                 response.message = 'SignUp user is disabled by Admin';
//                 logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                 res.status(200).json(response);
//                 return res.end();
//             }

//             const isValidation = await this.registerValidation(
//                 email,
//                 password,
//                 user_name,
//                 confirm_password,
//                 mobile,
//                 country_code,
//                 phone_verifiy,
//             );
//             if (isValidation.valid == false) {
//                 response.code = isValidation.code;
//                 response.message = isValidation.message;
//                 logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                 res.status(200).json(response);
//                 return res.end();
//             }
//         } catch (error) {
//             response.code = message_config.error.something_wrong.code;
//             response.message = message_config.error.something_wrong.message;
//             response.error = error.toString();
//             logger.error('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, error);
//             res.status(200).json(response);
//             return res.end();
//         }

//         if (email)
//  email = email.toLowerCase();
//         try {
//             // const BCRYPT_SALT_ROUNDS = 12;
//             bcrypt.hash(password, 12, async(err, hash_password) => {
//                 if (err) {
//                     response.code = message_config.error.user_not_found.message;
//                     response.message = 'Password hash genration failed.';
//                     logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                     res.status(200).json(response);
//                     return res.end();
//                 }

//                 let email_part, email_2fa, mobile_2fa;
//                 if (email)
//  {
//                     email_part = emailSplit(email)
// ;
//                     email_part = email_part.local;
//                     email_2fa = 'enable';
//                     mobile_2fa = 'disable';
//                 } else {
//                     email_part = user_name;
//                     email_2fa = 'disable';
//                     mobile_2fa = 'enable';
//                 }

//                 var login_datetime = new Date();
//                 var expire_datetime = login_datetime.setMinutes(login_datetime.getMinutes() + 30);
//                 var activation_code_expiry = new Date(expire_datetime);

//                 let user_data = {
//                     firstname: user_name,
//                     lastname: '',
//                     password: hash_password,
//                     status: 1,
//                     email,
//                     user_name,
//                     created_date: new Date(),
//                     modified_date: new Date(),
//                     created_ip: ip,
//                     modified_ip: ip,
//                     activation_code_expiry: activation_code_expiry,
//                     activation_code: unique_id,
//                     email_active: 0,
//                     mobile_active: 0,
//                     phone_verifiy: mobile != null ? phone_verifiy : false,
//                     ISO_letter: mobile != null ? ISO_letter : null,
//                     contact_number: mobile,
//                     referer_code: Date.now(),
//                     google_2fa_code: '',
//                     email_2fa,
//                     mobile_2fa,
//                     email_2fa_username: email_part,
//                     email_2fa_code: Math.floor(100000 + Math.random() * 900000),
//                     country_code: country_code,
//                 };
//                 var full_name = user_name;
//                 let IsExist;

//                 if (email != null) IsExist = await userModel.FindOne({ email: email });

//                 if (IsExist != null) {
//                     response.code = message_config.error.user_not_found.message;
//                     response.message = 'User already exists.. Please using another email or mobile';
//                     logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                     return res.status(200).json(response);

//                 } else {

//                     //GENRATE GOOGLE 2FA SECRECT KEY FOR USER
//                     const secret = speakeasy.generateSecret({ length: 10, name: 'PayUs' });
//                     await QRCode.toDataURL(secret.otpauth_url, async(err, data_url) => {
//                         if (err) {
//                             response.code = message_config.error.merchant_registration_failed.code;
//                             response.message = message_config.error.merchant_registration_failed.message;
//                             response.error = err;
//                             logger.info('(%s) - podId=[%s] - Response=[%o]', FUNCTION_NAME, this.podId, response);
//                             res.status(200).json(response);
//                             return res.end();
//                         }

//                         // $$$$$----ADD REFREL BENIFIT BALANCE ----$$$$$
//                         if (!isEmpty(ref_code)) {
//                             let isExistRefer = await userModel.FindOn