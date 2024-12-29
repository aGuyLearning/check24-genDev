import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { StreamingPackagesComponent } from './pages/streaming-packages/streaming-packages.component';

export const routes: Routes = [
    { path: '', redirectTo: 'landing-page', pathMatch: 'full' },
    {path: 'landing-page', component: LandingPageComponent},
    { path: 'streaming-packages', component: StreamingPackagesComponent}

];
