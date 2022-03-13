const arenaDom = document.getElementById("arena")
const types = ["deathKnight", "dreadKnight", "ghost", "Lich", "necromancer", "reaper", "skeleton", "skeletonArcher", "zombie", "zombieButcher"]
class Character {
    constructor() {
        this.type = types[Math.floor(Math.random() * types.length)]
        this.altitude = 0
        this.position = Math.floor(Math.random() * arenaDom.getBoundingClientRect().width)
        this.domElement = document.createElement("div")
        this.chatElement = null
        this.state = "idle"
        this.domElement.classList.add("character", this.type, this.state)
        this.domElement.style.left = `${this.position}px`
        arenaDom.appendChild(this.getDomElement())
        this.act()
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
        this.domElement.innerHTML = ''
        this.chatElement = this._newChatElement(text)
        this.domElement.appendChild(this.chatElement)
        setTimeout(() => {
            if (this.chatElement) {
                this.chatElement.remove()
            }
        }, 5000)
    }
    _newChatElement = (text) => {
        const chatElement = document.createElement('span')
        chatElement.classList.add('chat')
        chatElement.innerText = text
        return chatElement
    }
    jump = () => {
        // TODO: Add jump class to dom element
        // TODO: setTimeout and remove jump class after animation ends.
    }
    act = () => {
        setInterval(() => {
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
    switch (message) {
        case '!join':
            if (!currentCharacter) {
                characters[tags['display-name']] = new Character()
            }
            break;
        case '!jump':
            if (currentCharacter) {
                currentCharacter.jump()
            }
            break;
        default:
            if (currentCharacter) {
                const walkRegex = message.match(/^!walk (\d+)/)
                if (walkRegex) {
                    currentCharacter.walkTo(Math.floor((arenaDom.getBoundingClientRect().width / 100) * walkRegex[1]))
                } else {
                    currentCharacter.talk(message)
                }
            }
    }
	console.log(`${tags['display-name']}: ${message}`);
})