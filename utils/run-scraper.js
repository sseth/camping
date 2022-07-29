import sendEmail from './send-email.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const _exec = promisify(exec);

const runScraper = async (data) => {
  let { parkID, jobID, start, end, nights, lastNotif } = data;
  const execStr =
    'python3 campsite-checker/camping.py' +
    ` --start-date ${start}` +
    ` --end-date ${end}` +
    ` --parks ${parkID}` +
    `${nights ? ' --nights ' + nights : ''}` +
    ' --json-output';
  console.log(`[${jobID}] ${execStr}`);

  const { stdout } = await _exec(execStr);
  // TODO: add condition: if stdout not empty ???????
  const res = JSON.parse(stdout);
  if (Object.keys(res).length) {
    // console.log(res);
    const diffMinutes = lastNotif
      ? Math.ceil((Date.now() - lastNotif) / (1000 * 60))
      : null;
    if (!!diffMinutes && diffMinutes < 60) {
      // console.log(
      //   `Last email sent ${diffMinutes} minutes ago — delaying notification`
      // );
      return null;
    }
    console.log(`[${jobID}] Sending email...`);
    await sendEmail(parkID, res[parkID]);
    return Date.now();
  }
};

export default runScraper;
