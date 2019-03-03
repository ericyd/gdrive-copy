import Timer from './Timer';

export default class QuotaManager {
  timer: Timer;

  constructor(timer: Timer) {
    this.timer = timer;
  }

  canContinue(): boolean {
    return true;
  }

  isRunningTooLong() {}
}
