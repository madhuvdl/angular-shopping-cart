import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public getApi(url) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': '12345'
    });
    return this.http.get<{}>(BACKEND_URL + url, {headers});
  }

  public postApi(url, data) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': '12345'
    });
    return this.http.post<{}>(BACKEND_URL + url, data, {headers});
  }

  public deleteApi(url, data?) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'token': '12345'
    });
    return this.http.delete<{}>(BACKEND_URL + url, {headers});
  }

}
