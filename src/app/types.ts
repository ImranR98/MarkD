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

const randomString = (length = 20) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export class Item {
    _id: string
    created: Date
    modified: Date

    title: string
    description: string
    due: Date
    archived: boolean

    constructor() {
        this._id = `item-${randomString()}`,
            this.title = '',
            this.description = '',
            this.due = null,
            this.archived = false,
            this.created = new Date(),
            this.modified = new Date()
    }
}

export class Stack {
    _id: string

    title: string
    archived: boolean

    items: Item[]

    constructor(title: string = '') {
        this._id = `stack-${randomString()}`,
            this.title = title,
            this.archived = false,
            this.items = []
    }
}

export class Board {
    _id: string

    title: string
    archived: boolean

    stacks: Stack[]

    constructor(title: string = '') {
        this._id = `board-${randomString()}`,
            this.title = title,
            this.archived = false,
            this.stacks = []
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