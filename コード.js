function sendEmailFromGoogleFormContent(e) {
  const responses = e.response.getItemResponses();

  const responseObj = {}
  responses.forEach((response) => {
    responseObj[response.getItem().getTitle()] = response.getResponse();
  })

  const formItemTitleMapping = getFormItemTitleMapping();

  const name = responseObj[formItemTitleMapping['name']];
  const email = responseObj[formItemTitleMapping['email']];
  const schedule = responseObj[formItemTitleMapping['schedule']];

  const subject = "イベント申し込み確認メール"
  const body = buildMailBody(name, schedule);
  const options = {
    name: 'イベント事業部'
  }

  GmailApp.sendEmail(email, subject, body, options)
}

const buildMailBody = (name, schedule) => {
  return `
${name} 様

この度はお申込みいただきありがとうございます。

以下の日程でお申し込みを受け付けました。

${schedule}
  `;
}

const getFormItemTitleMapping = () => {
  return {
    name: 'お名前',
    email: 'メールアドレス',
    schedule: '参加日程'
  }
}

