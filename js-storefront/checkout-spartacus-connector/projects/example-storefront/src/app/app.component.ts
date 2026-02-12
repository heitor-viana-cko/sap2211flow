import { Component } from '@angular/core';
import LogRocket from 'logrocket';

const logRocketAppId: string = 'LOG_ROCKET_APP_ID';

// Initialize LogRocket with your app ID
try {
  if (!logRocketAppId.includes('LOG_ROCKET')){
    LogRocket.init(logRocketAppId);
  }
} catch (err) {
  console.warn('failed to initialize logrocket', err);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title: string = 'example-storefront';
}
