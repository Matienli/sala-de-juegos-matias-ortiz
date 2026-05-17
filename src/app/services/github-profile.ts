import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { GitHubUser } from '../models/github-user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GithubProfileService {
  private readonly http = inject(HttpClient);

  getStudentProfile(): Observable<GitHubUser> {
    const url = `${environment.githubApiBaseUrl}/users/${environment.githubUsername}`;
    return this.http.get<GitHubUser>(url);
  }
}
