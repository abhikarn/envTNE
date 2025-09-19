import { Injectable, NgZone } from '@angular/core';
import { fromEvent, merge, Subject, Subscription, timer } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private userAction$ = new Subject<void>();
  private subs: Subscription = new Subscription();
  private warningActive = false;

  constructor(private ngZone: NgZone) { }

  startWatching(
    idleMinutes: number,
    warningMinutes: number,
    onWarning: () => void,
    onTimeout: () => void
  ) {
    this.stopWatching();

    const idleMs = idleMinutes * 60 * 1000;
    const warningMs = warningMinutes * 60 * 1000;
    const preWarningMs = Math.max(1000, idleMs - warningMs);

    console.log('SessionTimeoutService: starting', { idleMs, warningMs, preWarningMs });

    this.ngZone.runOutsideAngular(() => {
      const activity$ = merge(
        fromEvent(window, 'mousemove'),
        fromEvent(window, 'keydown'),
        fromEvent(window, 'click'),
        fromEvent(window, 'scroll'),
        this.userAction$
      ).pipe(startWith(null));

      const sub = activity$
        .pipe(
          switchMap(() => {
            if (this.warningActive) {
              console.log('SessionTimeoutService: ignoring activity during warning phase');
              return timer(999999999); // fake never-ending timer
            }
            console.log('SessionTimeoutService: activity detected, reset idle timer');
            return timer(preWarningMs);
          })
        )
        .subscribe(() => {
          this.ngZone.run(() => {
            console.log('SessionTimeoutService: warning triggered');
            this.warningActive = true;
            onWarning();

            const warnSub = timer(warningMs).subscribe(() => {
              this.ngZone.run(() => {
                console.log('SessionTimeoutService: timeout reached');
                this.warningActive = false;
                onTimeout();
              });
            });

            this.subs.add(warnSub);
          });
        });

      this.subs.add(sub);
    });
  }

  resetTimer() {
    console.log('SessionTimeoutService: reset timer');
    this.warningActive = false; // exit warning mode
    this.userAction$.next();
  }

  stopWatching() {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.warningActive = false;
  }
}
