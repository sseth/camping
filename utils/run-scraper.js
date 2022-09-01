import sendEmail from './send-email.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const _exec = promisify(exec);

const runScraper = async (data) => {
  let { parkID, jobID, start, end, nights, lastNotif } = data;
  const execStr =
    'python3 campsite-checker/camping.py' +
    ' --json-output' +
    ` --parks ${parkID}` +
    ` --start-date ${start}` +
    ` --end-date ${end}` +
    `${nights ? ' --nights ' + nights : ''}`;
  console.log(`[${jobID}] ${execStr}`);

  const { stdout } = await _exec(execStr);
  // TODO: add condition: if stdout not empty ???????
  const res = JSON.parse(stdout)[0];

  const name = res['name']
    .split(' ')
    .map((word) => word[0] + word.slice(1).toLowerCase())
    .join(' ');

  const info = { name, sent: false };

  if (Object.keys(res).includes('sites')) {
    const diffMinutes = lastNotif
      ? Math.ceil((Date.now() - lastNotif) / (1000 * 60))
      : null;
    if (!diffMinutes || diffMinutes >= 60) {
      console.log(`[${jobID}] Sending email...`);
      await sendEmail(parkID, name, res['sites']);
      info.sent = Date.now();
    }
  }

  return info;
};

export default runScraper;
