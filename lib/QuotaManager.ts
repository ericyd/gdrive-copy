import Timer from './Timer';

export default class QuotaManager {
  timer: Timer;
  userProperties: GoogleAppsScript.Properties.UserProperties;
  stop: boolean;

  constructor(
    timer: Timer,
    userProperties: GoogleAppsScript.Properties.UserProperties
  ) {
    this.timer = timer;
    this.userProperties = userProperties;
    this.stop = false;
  }

  update() {
    this.timer.update();
    this.stop = this.userProperties.getProperty('stop') == 'true';
  }

  canContinue(): boolean {
    return this.timer.canContinue() && !this.stop;
  }
}
