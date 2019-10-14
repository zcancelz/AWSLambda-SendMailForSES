const database = require('./config/database.js');
const errorCode= require('./config/error-code.json');
const q = require('./config/query');
const mailTypeList = require('./config/mailTypeList.js');
const aws = require('aws-sdk');

const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async (event) => {
    const con = database.init();
    let response = '';
    try{
        // console.log(mailTypeList[0]);
        if('daily_check' === event.mode){
            let mailsendPromises =  mailTypeList.map(async (key)=>{
                return await checkSendMailList(con, key);
            });
            await Promise.all(mailsendPromises);
        }else{
            await checkSendMailList(con, event.mode);
        }
        response = createResponseData('0000');

    }catch (e) {
        console.log(e.message);
        response = await createResponseData('9999');
    }
    return await response;
};

async function checkSendMailList(con, mode=''){
    let log = { mode: mode };
    let connection;
    let templateDataList;
    try{
        connection = await con.getConnection(async conn=>conn);
        [templateDataList] = await connection.query(q[mode]);
        connection.release();
    }catch (e) {
        log.message = e.message;
        throw log;
    }

    //send ses
    /**ses format
     // {
        //     Destination:{
        //         ToAddresses:['']
        //     },
        //     Source: 'senderEmail',
        //     Template: '',
        //     TemplateData: '{}'
        // }
     */
    let promises = templateDataList.map(templateData=>{
        const mailRequest = createTemplateData( templateData, mode + '_' + templateData.lang, mode);
        log.mailRequest = mailRequest;

        return sendTemplateMail(mailRequest, log);
    });
    await Promise.all(promises);
    return promises;
}
function createTemplateData(templateData, templateName, mode) {
    let templateRequest = {
        Destination:{
            ToAddresses:[]
        },
        Source: 'zcancelz@zcancelz.com',
        Template: templateName,
        TemplateData: ''
    };
    templateRequest.Destination.ToAddresses.push(templateData.userEmail);
    templateRequest.TemplateData = JSON.stringify(templateData);

    return templateRequest;
}

async function sendTemplateMail(mailRequest, log) {
    let mailResponse;
    try{
        mailResponse = await ses.sendTemplatedEmail(mailRequest).promise();
        log.mailResponse = mailResponse;
    }catch(e){
        log.message= e.message;
        await console.log(log);
    }
    console.log(log);
}

function createResponseData(code, data='success') {
    let responseData = {
        statusCode: 200,
        message: 'success'
    }
    if ('0000' !== code) {
        responseData.statusCode = 500;
        responseData.message = errorCode[code];
    } else {
        responseData.message = data;
    }
    return responseData;
}
