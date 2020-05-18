export class NoteInfo {
    fileName: string = ''
    modified: Date = new Date()
    created: Date = new Date()
}

export class FolderInfo {
    folder: string = ''
    notes: NoteInfo[] = []
}

export class Note {
    info: NoteInfo = new NoteInfo()
    folder: string = ''
    data: string = ''

    constructor(folder: string = '') {
        this.folder = folder
    }
}

export class AppError {
    message: string
    actionable: boolean
    constructor(actionable: boolean = false, message: string = 'Unknown Error') {
        this.actionable = actionable
        this.message = message
    }
}