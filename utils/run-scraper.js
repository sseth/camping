import sendEmail from './send-email.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const _exec = promisify(exec);

const runScraper = async (park) => {
  // console.log('doing job');
  let { parkID, start, end, nights, jobID, lastNotif } = park;
  console.log('running', jobID);
  const execStr =
    'python3 ./campsite-checker/camping.py' +
    ` --start-date ${start}` +
    ` --end-date ${end}` +
    ` --parks ${parkID}` +
    `${nights ? ' --nights ' + nights : ''}` +
    ' --json-output';
  console.log(execStr);
  // /*
  const { stdout } = await _exec(execStr);
  // TODO: add condition: if stdout not empty ???????
  const res = JSON.parse(stdout);
  if (Object.keys(res).length) {
    console.log(res);
    console.log('Sending email');
    // send only if not sent in the last hour
    const diffMinutes = Math.ceil((Date.now() - lastNotif) / (1000 * 60));
    if (diffMinutes < 60) {
      console.log(`Last email sent ${diffMinutes} ago — delaying notification`);
      return null;
    }
    await sendEmail(parkID, res[parkID]);
    return Date.now();
  } // */
};

export default runScraper;
