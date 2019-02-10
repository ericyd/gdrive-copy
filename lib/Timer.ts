import Properties from "./Properties";

/**********************************************
 * Tracks runtime of application to avoid
 * exceeding Google quotas
 **********************************************/

export default class Timer {
  // Max runtime per day is 90 minutes. Set max as 88 mins for padding.
  // https://developers.google.com/apps-script/guides/services/quotas
  static MAX_RUNTIME_PER_DAY: number = 88 * 1000 * 60;
  static MAX_RUNTIME: number = 4.7 * 1000 * 60;
  // durations used for setting Triggers
  static oneDay: number = 24 * 60 * 60 * 1000;
  static sixMinutes: number = 6.2 * 1000 * 60;

  START_TIME: number;
  runtime: number;
  timeIsUp: boolean;
  stop: boolean;

  constructor() {
    this.START_TIME = new Date().getTime();
    this.runtime = 0;
    this.timeIsUp = false;
    this.stop = false;

    return this;
  }

  /**
   * Update current time
   */
  update(userProperties: GoogleAppsScript.Properties.UserProperties): void {
    this.runtime = Timer.now() - this.START_TIME;
    this.timeIsUp = this.runtime >= Timer.MAX_RUNTIME;
    this.stop = userProperties.getProperty('stop') == 'true';
  }

  canContinue(): boolean {
    return !this.timeIsUp && !this.stop;
  }

  /**
   * Calculate how far in the future the trigger should be set
   */
  calculateTriggerDuration(properties: Properties): number {
    return properties.checkMaxRuntime()
      ? Timer.oneDay
      : Timer.sixMinutes - this.runtime;
  }

  static now(): number {
    return new Date().getTime();
  }
}
