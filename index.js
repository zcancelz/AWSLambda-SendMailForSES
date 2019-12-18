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
            let mailSendPromises =  mailTypeList.map(async (mail)=>{
                return await checkSendMailList(con, mail.mode, mail.variable);
            });
            await Promise.all(mailSendPromises);
        }else{
            await checkSendMailList(con, event.mode, event.variable);
        }
        response = createResponseData('0000');

    }catch (e) {
        console.log(e.message);
        response = await createResponseData('9999');
    }

    return await response;
};

async function checkSendMailList(con, mode='', variable=[]){
    let log = { mode: mode };
    let connection;
    let templateDataList;
    try{
        connection = await con.getConnection(async conn=>conn);
        if(variable.size===0){
            [templateDataList] = await connection.query(q[mode])
        }else{
            console.log(mode, variable);
            console.log(q[mode]);
            [templateDataList] = await connection.query(q[mode], variable);
        }
        connection.release();
    }catch (e) {
        console.log(e);
        log.message = e.message;
        throw log;
    }
    console.log(templateDataList);
    //send ses
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
        log.message= await e.message;
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
