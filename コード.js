function main(e) {
  const { name, email, schedule } = getFormResponses(e);

  sendEmail(name, email, schedule);
  notifyLINE(name, email, schedule);
}

/**
 * Googleフォーム送信時に実行される
 * @param {GoogleAppsScript.Events.FormsOnFormSubmit} e
 */
const getFormResponses = (e) => {
  if (!e) {
    throw new Error('イベントが発火していません')
  }

  const responses = e.response.getItemResponses();
  if (!responses) {
    throw new Error('レスポンスが存在しません')
  }

  const responseObj = {}
  responses.forEach((response) => {
    responseObj[response.getItem().getTitle()] = response.getResponse();
  })

  const formItemTitleMapping = getFormItemTitleMapping();
  const name = responseObj[formItemTitleMapping['name']];
  const email = responseObj[formItemTitleMapping['email']];
  const schedule = responseObj[formItemTitleMapping['schedule']];

  return {
    name: name,
    email: email,
    schedule: schedule
  }
}

const buildMailBody = (name, schedule) => {
  return `
    ${name} 様

    この度はお申込みいただきありがとうございます。

    以下の日程でお申し込みを受け付けました。

    ${schedule}
  `;
}

const buildLineMessageBody = (name, email, schedule) => {
  return `
    下記日程に申し込みが入りました。 

    お名前: ${name}
    メールアドレス: ${email}
    日程: ${schedule}
  `;
}

const sendEmail = (name, email, schedule) => {
  const subject = "イベント申し込み確認メール"
  const body = buildMailBody(name, schedule);
  const options = {
    name: 'イベント事業部'
  }

  GmailApp.sendEmail(email, subject, body, options)
}

const getFormItemTitleMapping = () => {
  return {
    name: 'お名前',
    email: 'メールアドレス',
    schedule: '参加日程'
  }
}

function notifyLINE(name, email, schedule) {
  const props = PropertiesService.getScriptProperties();

  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': `Bearer ${props.getProperty('CHANNEL_ACCESS_TOKEN')}`,
  }

  const message = buildLineMessageBody(name, email, schedule);

  const data = {
    'to': props.getProperty('USER_ID'),
    'messages': [
      {
        'type': 'text',
        'text': message 
      }
    ],
  }

  const options = {
    'method': 'post',
    'headers': headers,
    'payload': JSON.stringify(data),
  }

  UrlFetchApp.fetch(props.getProperty('PUSH_MESSAGE_URL'), options);
}
