export class NoteInfo {
    fileName: string = ''
    modified: Date | string = new Date()
    created: Date | string = new Date()
}

export class CategoryInfo {
    category: string = ''
    categories: NoteInfo[] = []
}

export class Note {
    info: NoteInfo = new NoteInfo()
    category: string = ''
    data: string = ''

    constructor(category: string = '') {
        this.category = category
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