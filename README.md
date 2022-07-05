# This ambassador bot is use in SW2 Minecraft Student Ambassador Discord Server

## Requirements

1. Discord Bot Token [Guide](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
2. Google sheet api [`CODE`](##Google%20sheet%20api%20code)
3. Node.js v18.2.0 or newer

## How to install a bot

1. Open terminal in home directory.
2. Run `git clone https://github.com/Fakpeng/ambassador-bot`
3. Change directory to ambassador-bot
4. run `npm install`
5. fill `.env.sample` file and change name to `.env`
6. Run the bot using
   - Linux: `bash ambassador-watchdog.sh`
   - Windows: `ambassador-watchdog.bat`

## Google sheet api code

```js
var ss = SpreadsheetApp.openById("[SpreadsheetID]");
var sheet = ss.getSheetByName("[SheetName]");

function doGet(e) {
	var action = e.parameter.action;
	if (action == "getEmails") {
		return getEmails(e);
	}
}

function getEmails(e) {
	var rows = sheet
		.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
		.getValues();
	var data = [];
	for (var i = 0; i < rows.length; i++) {
		var row = rows[i];
		data.push(row[1]);
	}
	var result = JSON.stringify(data);
	return ContentService.createTextOutput(result).setMimeType(
		ContentService.MimeType.JSON
	);
}
```
