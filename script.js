const arenaDom = document.getElementById("arena")
const types = [
    "deathKnight",
    "dreadKnight",
    "ghost",
    "Lich",
    "necromancer",
    "reaper",
    "skeleton",
    "skeletonArcher",
    "zombie",
    "zombieButcher",
    "archerMan",
    "cavalierMan",
    "crossbowMan",
    "goblin",
    "goblinThief",
    "halberdMan",
    "horseMan",
    "kingMan",
    "orc",
    "orcAxeThrower",
    "orcBerserker",
    "orcVeteran",
    "orcWarChief",
    "orcWarrior",
    "princeMan",
    "shieldMan",
    "spearMan",
    "swordMan",
    "wargRider",
    "wolfRider"
]
const typesLowercase = types.map(item => item.toLowerCase())
class Character {
    constructor(name, type) {
        this.type = type || types[Math.floor(Math.random() * types.length)]
        this.altitude = 0
        this.position = Math.floor(Math.random() * arenaDom.getBoundingClientRect().width)
        this.state = "idle"
        this.chatElement = this._newChatElement(name)
        this.domElement = this.createDomElement()
        this.name = name
        arenaDom.appendChild(this.getDomElement())
        this.actInterval = null
        this.act()
        this.chatClearTimeout = null
        this.disappearTimeout = null
        this._setDeathTimer()
        this.interrupt = false
    }
    _setDeathTimer = () => {
        if (this.disappearTimeout) {
            clearTimeout(this.disappearTimeout)
        }
        this.disappearTimeout = setTimeout(() => {
            this.domElement.remove()
            characters[this.name] = null
        }, 30 * 60 * 1000) // 30 minutes
    }
    createDomElement = () => {
        const domElement = document.createElement("div")
        const chatElement = this.chatElement
        domElement.appendChild(chatElement)
        domElement.classList.add("character", this.type, this.state)
        domElement.style.left = `${this.position}px`
        return domElement
    }
    getDomElement = () => {
        return this.domElement
    }
    setState = (state) => {
        this.domElement.classList.remove(this.state)
        this.state = state
        this.domElement.classList.add(this.state)
    }
    setDirection = (direction) => {
        if (direction === "left") {
            this.domElement.classList.add("leftDirection")
        } else {
            this.domElement.classList.remove("leftDirection")
        }
    }
    walkTo = (newPosition) => {
        if (this.state === "idle") {
            this._walkTo(newPosition)
        }
    }
    _walkTo = (newPosition) => {
        this.setState("walk")
        setTimeout(() => {
            if (this.interrupt) {
                this.setState("idle")
                this.interrupt = false
                return
            }
            if (this.position > newPosition) {
                this.setDirection("left")
                this.position--
            } else {
                this.setDirection("right")
                this.position++
            }
            this.domElement.style.left = `${this.position}px`
            if (this.position !== newPosition) {
                this._walkTo(newPosition)
            } else {
                this.setState("idle")
            }
        }, 10)
    }
    talk = (text) => {
        if (this.chatClearTimeout) {
            clearTimeout(this.chatClearTimeout)
        }
        this.chatElement.innerText = `${this.name} \n ${text}`

        this.chatClearTimeout = setTimeout(() => {
            this.chatElement.innerText = this.name
        }, 5000)
    }
    _newChatElement = (text) => {
        const chatElement = document.createElement('span')
        chatElement.classList.add('chat')
        chatElement.innerText = text
        return chatElement
    }
    changeType = (newType) => {
        this.domElement.classList.remove(this.type)
        this.type = newType
        this.domElement.classList.add(newType)
    }
    jump = () => {
        this.interrupt = true
        setTimeout(() => {
            this.setState("jump")
            if (this.domElement.classList.contains("leftDirection")) {
                this.position -= 100
            } else {
                this.position += 100
            }
            this.domElement.style.left = `${this.position}px`
            setTimeout(() => {
                this.setState("idle")
            }, 1000)
        }, 20)
    }
    act = () => {
        this.actInterval = setInterval(() => {
            this.walkTo(Math.floor(Math.random() * arenaDom.getBoundingClientRect().width))
        }, Math.random() * 10000)
    }
}

const characters = {}

const windowSearchParams = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
const twitchClient = new tmi.Client({ channels: [windowSearchParams.channel] })
twitchClient.connect()
twitchClient.on('message', (channel, tags, message, self) => {
    const currentCharacter = characters[tags['display-name']]
    if (currentCharacter) {
        currentCharacter._setDeathTimer()
    }
    switch (0) {
        case message.indexOf('!join'):
            if (!currentCharacter) {
                let charType = null
                const messageSplit = message.split(" ")
                if (messageSplit.length > 1) {
                    const selectedCharacterIndex = typesLowercase.indexOf(messageSplit[1].toLowerCase())
                    if (selectedCharacterIndex > -1) {
                        charType = types[selectedCharacterIndex]
                    }
                }
                characters[tags['display-name']] = new Character(tags['display-name'], charType)
            }
            break;
        case message.indexOf('!leave'):
            if (currentCharacter) {
                clearTimeout(currentCharacter.disappearTimeout)
                currentCharacter.domElement.remove()
                characters[tags['display-name']] = null
            }
            break;
        case message.indexOf('!jump'):
            if (currentCharacter) {
                currentCharacter.jump()
            }
            break;
        default:
            if (currentCharacter) {
                const walkRegex = message.match(/^!walk (\d+)/)
                const changeRegex = message.match(/^!change (\w+)/)
                if (walkRegex) {
                    currentCharacter.interrupt = true
                    setTimeout(() => {
                        currentCharacter.walkTo(Math.floor((arenaDom.getBoundingClientRect().width / 100) * walkRegex[1]))
                    }, 20)
                } else if (changeRegex) {
                    const selectedCharacterIndex = typesLowercase.indexOf(changeRegex[1].toLowerCase())
                    if (selectedCharacterIndex > -1) {
                        currentCharacter.changeType(types[selectedCharacterIndex])
                    }
                } else {
                    currentCharacter.talk(message)
                }
            }
    }
	console.log(`${tags['display-name']}: ${message}`);
})
// twitchClient.on('part', (channel, username, self) => {
//     const currentCharacter = characters[username]
//     if (currentCharacter) {
//         currentCharacter.domElement.remove()
//         characters[username] = null
//     }
// })
