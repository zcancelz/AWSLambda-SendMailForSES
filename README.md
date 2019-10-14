# AWSLambda-SendMailForSES

Using AWS SES and Lambda, you can send mail with only the query selected from MySql.

node version : 8.10.0

## How to add a mailing list
1. Create mail template.
2. Create a template in AWS SES.(naming : {type}_{lang})
3. Add query or dailyMailType  to query.js, mailTypeList.js
- mailTypeList.js : Added the type name used when creating ses template.
- query.js : Create a query with the type name used when creating the ses template. Select the list to be replaced in the template by query.  
![architecture](./architecture.png)

### 호출 규격
```json
{
    "mode": "{{mode}}"
}
```
mode : The type name used when creating the SES mail.
 - Calling 'dailly_check' with the mode value executes all items in the mailTypeList.js list.

## NPM run Scripts
- daily : Send all daily check items
- test : Send mail with test query

 

