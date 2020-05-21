import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AppError } from '../types'
import { HttpErrorResponse } from '@angular/common/http'
import { environment } from 'src/environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(private snackBar: MatSnackBar) { }

  showSimpleSnackBar(message: string) {
    this.snackBar.dismiss()
    this.snackBar.open(message, 'Okay', {
      duration: 5000
    })
  }

  standardizeError(error: any, actionable: boolean = false) {
    let standardError: AppError = new AppError(actionable)

    //Since Backend Server routes all 404 requests to the Frontend, this will be seen as a 200 response with HTML body
    if (error instanceof HttpErrorResponse) {
      if (error.status == 200 || error.status == 404) {
        standardError.message = '404 - Not Found'
      } else {
        if (typeof error.error == 'string') {
          if (error.error.indexOf('<!DOCTYPE html') == -1) {
            standardError.message = error.error
          } else {
            standardError.message = error.statusText
          }
        } else {
          standardError.message = error.statusText
        }
      }
    }

    if (typeof error == 'string') {
      standardError.message = error
    }

    return standardError
  }

  showError(error: any, callback: Function = null, duration: number = 5000) {
    if (!environment.production) {
      console.log(error)
    }
    error = this.standardizeError(error, (!!callback))
    this.snackBar.dismiss()
    let actionText = 'Okay'
    if (callback) {
      actionText = 'Retry'
    }
    if (duration) {
      this.snackBar.open(error.message, actionText, { duration: duration }).onAction().subscribe(() => {
        if (callback) {
          callback()
        }
      })
    } else {
      this.snackBar.open(error.message, actionText).onAction().subscribe(() => {
        if (callback) {
          callback()
        }
      })
    }

  }

  clearError() {
    this.snackBar.dismiss()
  }
}
